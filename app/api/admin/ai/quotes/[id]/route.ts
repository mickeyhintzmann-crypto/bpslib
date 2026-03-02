import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  AI_CONTROL_ROOM_MIGRATION,
  AI_REVIEW_STATUS_VALUES,
  asSingleRelation,
  asTrimmed,
  isMissingAiTable,
  sanitizeObject
} from "@/lib/ai-estimator-control-room";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AiLeadRelation = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
};

type AiRequestRow = {
  id: string;
  created_at: string;
  service: string;
  lead_id: string | null;
  page_url: string | null;
  utm: Record<string, unknown> | null;
  inputs: Record<string, unknown> | null;
  images: unknown[] | null;
  client_meta: Record<string, unknown> | null;
  lead: AiLeadRelation | AiLeadRelation[] | null;
};

type AiResultRow = {
  id: string;
  created_at: string;
  request_id: string;
  prompt_version_id: string | null;
  output: Record<string, unknown> | null;
  confidence: number | null;
  needs_review: boolean;
  review_status: string;
  admin_feedback: string | null;
  admin_override: Record<string, unknown> | null;
  request: AiRequestRow | AiRequestRow[] | null;
};

type PromptVersionRow = {
  id: string;
  name: string;
  service: string;
};

const RESULT_SELECT =
  "id, created_at, request_id, prompt_version_id, output, confidence, needs_review, review_status, admin_feedback, admin_override, request:request_id(id, created_at, service, lead_id, page_url, utm, inputs, images, client_meta, lead:lead_id(id, name, email, phone, location, message))";

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
};

const parseOverride = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return {};
    }
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("admin_override skal være et JSON objekt.");
    }
    return parsed as Record<string, unknown>;
  }
  if (!value) {
    return {};
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw new Error("admin_override skal være et objekt eller JSON-string.");
};

const buildDetailPayload = async (
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  row: AiResultRow
) => {
  const requestItem = asSingleRelation(row.request);
  const leadItem = asSingleRelation(requestItem?.lead);

  let promptVersion: PromptVersionRow | null = null;
  if (row.prompt_version_id) {
    const { data: promptData } = await supabase
      .from("ai_prompt_versions")
      .select("id, name, service")
      .eq("id", row.prompt_version_id)
      .maybeSingle();

    if (promptData) {
      promptVersion = promptData as PromptVersionRow;
    }
  }

  return {
    result: {
      id: row.id,
      created_at: row.created_at,
      request_id: row.request_id,
      prompt_version_id: row.prompt_version_id,
      output: sanitizeObject(row.output),
      confidence: row.confidence,
      needs_review: row.needs_review,
      review_status: row.review_status,
      admin_feedback: row.admin_feedback,
      admin_override: sanitizeObject(row.admin_override)
    },
    request: requestItem
      ? {
          id: requestItem.id,
          created_at: requestItem.created_at,
          service: requestItem.service,
          lead_id: requestItem.lead_id,
          page_url: requestItem.page_url,
          utm: sanitizeObject(requestItem.utm),
          inputs: sanitizeObject(requestItem.inputs),
          images: Array.isArray(requestItem.images) ? requestItem.images : [],
          client_meta: sanitizeObject(requestItem.client_meta)
        }
      : null,
    promptVersion,
    lead: leadItem
      ? {
          id: leadItem.id,
          name: leadItem.name,
          email: leadItem.email,
          phone: leadItem.phone,
          location: leadItem.location,
          message: leadItem.message,
          page_url: requestItem?.page_url || null
        }
      : null
  };
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler quote id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("ai_quote_results")
      .select(RESULT_SELECT)
      .eq("id", id)
      .single();

    if (error || !data) {
      if (
        isMissingAiTable(error?.message, "ai_quote_results") ||
        isMissingAiTable(error?.message, "ai_quote_requests")
      ) {
        return NextResponse.json(
          {
            message: `AI control room-tabeller mangler. Kør migrationen ${AI_CONTROL_ROOM_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Quote blev ikke fundet." }, { status: 404 });
    }

    const payload = await buildDetailPayload(supabase, data as AiResultRow);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af quote detalje." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler quote id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    const hasReviewStatus = Object.prototype.hasOwnProperty.call(payload, "review_status");
    let overrideChanged = false;

    if (hasReviewStatus) {
      const reviewStatus = asTrimmed(payload.review_status).toLowerCase();
      if (!AI_REVIEW_STATUS_VALUES.includes(reviewStatus as (typeof AI_REVIEW_STATUS_VALUES)[number])) {
        return NextResponse.json({ message: "Ugyldig review_status." }, { status: 400 });
      }
      updates.review_status = reviewStatus;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "needs_review")) {
      updates.needs_review = payload.needs_review === true;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "admin_feedback")) {
      const feedback = asTrimmed(payload.admin_feedback);
      updates.admin_feedback = feedback || null;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "confidence")) {
      if (payload.confidence === null || payload.confidence === undefined || payload.confidence === "") {
        updates.confidence = null;
      } else {
        const parsedConfidence = Number(payload.confidence);
        if (Number.isNaN(parsedConfidence)) {
          return NextResponse.json({ message: "Ugyldig confidence." }, { status: 400 });
        }
        updates.confidence = parsedConfidence;
      }
    }

    const supabase = createSupabaseServiceClient();
    if (Object.prototype.hasOwnProperty.call(payload, "admin_override")) {
      const parsedOverride = parseOverride(payload.admin_override);

      const { data: existingOverrideRow, error: existingOverrideError } = await supabase
        .from("ai_quote_results")
        .select("id, admin_override")
        .eq("id", id)
        .maybeSingle();

      if (existingOverrideError) {
        return NextResponse.json({ message: existingOverrideError.message }, { status: 500 });
      }

      if (!existingOverrideRow) {
        return NextResponse.json({ message: "Quote blev ikke fundet." }, { status: 404 });
      }

      const currentOverride = sanitizeObject(existingOverrideRow.admin_override);
      overrideChanged = JSON.stringify(currentOverride) !== JSON.stringify(parsedOverride);
      updates.admin_override = parsedOverride;
    }

    if (overrideChanged && !hasReviewStatus) {
      updates.review_status = "edited";
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Ingen felter at opdatere." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ai_quote_results")
      .update(updates)
      .eq("id", id)
      .select(RESULT_SELECT)
      .single();

    if (error || !data) {
      if (
        isMissingAiTable(error?.message, "ai_quote_results") ||
        isMissingAiTable(error?.message, "ai_quote_requests")
      ) {
        return NextResponse.json(
          {
            message: `AI control room-tabeller mangler. Kør migrationen ${AI_CONTROL_ROOM_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke opdatere quote." }, { status: 500 });
    }

    const responsePayload = await buildDetailPayload(supabase, data as AiResultRow);
    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "admin_override JSON kunne ikke parses." }, { status: 400 });
    }
    if (error instanceof Error && error.message.toLowerCase().includes("admin_override")) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Uventet fejl ved opdatering af quote." }, { status: 500 });
  }
}
