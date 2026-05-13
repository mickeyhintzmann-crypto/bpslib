import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  AI_CONTROL_ROOM_MIGRATION,
  asSingleRelation,
  asTrimmed,
  isAiReviewStatus,
  isMissingAiTable,
  sanitizeObject
} from "@/lib/ai-estimator-control-room";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AiRequestRelation = {
  id: string;
  created_at: string;
  service: string;
  lead_id: string | null;
  page_url: string | null;
  inputs: Record<string, unknown> | null;
  images: unknown[] | null;
  client_meta: Record<string, unknown> | null;
  utm: Record<string, unknown> | null;
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
  request: AiRequestRelation | AiRequestRelation[] | null;
};

type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
};

type PromptRow = {
  id: string;
  name: string;
  service: string;
  prompt: string;
  rules: Record<string, unknown> | null;
  is_active: boolean;
};

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
};

const buildDetailItem = async (
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  row: AiResultRow
) => {
  const request = asSingleRelation(row.request);
  const leadId = request?.lead_id || null;
  const promptVersionId = row.prompt_version_id;

  let lead: LeadRow | null = null;
  if (leadId) {
    const { data: leadData } = await supabase
      .from("leads")
      .select("id, name, email, phone, location, message")
      .eq("id", leadId)
      .maybeSingle();
    if (leadData) {
      lead = leadData as LeadRow;
    }
  }

  let promptVersion: PromptRow | null = null;
  if (promptVersionId) {
    const { data: promptData } = await supabase
      .from("ai_prompt_versions")
      .select("id, name, service, prompt, rules, is_active")
      .eq("id", promptVersionId)
      .maybeSingle();
    if (promptData) {
      promptVersion = promptData as PromptRow;
    }
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    requestId: row.request_id,
    promptVersionId: row.prompt_version_id,
    output: sanitizeObject(row.output),
    confidence: row.confidence,
    needsReview: row.needs_review,
    reviewStatus: row.review_status,
    adminFeedback: row.admin_feedback,
    adminOverride: sanitizeObject(row.admin_override),
    request: request
      ? {
          id: request.id,
          createdAt: request.created_at,
          service: request.service,
          leadId: request.lead_id,
          pageUrl: request.page_url,
          inputs: sanitizeObject(request.inputs),
          images: request.images || [],
          clientMeta: sanitizeObject(request.client_meta),
          utm: sanitizeObject(request.utm)
        }
      : null,
    lead: lead
      ? {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          location: lead.location,
          message: lead.message
        }
      : null,
    promptVersion: promptVersion
      ? {
          id: promptVersion.id,
          name: promptVersion.name,
          service: promptVersion.service,
          prompt: promptVersion.prompt,
          rules: promptVersion.rules || {},
          isActive: promptVersion.is_active
        }
      : null
  };
};

const RESULT_SELECT =
  "id, created_at, request_id, prompt_version_id, output, confidence, needs_review, review_status, admin_feedback, admin_override, request:request_id(id, created_at, service, lead_id, page_url, inputs, images, client_meta, utm)";

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler result id." }, { status: 400 });
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
      return NextResponse.json({ message: error?.message || "Resultat blev ikke fundet." }, { status: 404 });
    }

    const item = await buildDetailItem(supabase, data as AiResultRow);
    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af AI resultat." }, { status: 500 });
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
      return NextResponse.json({ message: "Mangler result id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(payload, "review_status")) {
      const reviewStatus = asTrimmed(payload.review_status).toLowerCase();
      if (!isAiReviewStatus(reviewStatus)) {
        return NextResponse.json({ message: "Ugyldig review status." }, { status: 400 });
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

    if (Object.prototype.hasOwnProperty.call(payload, "admin_override")) {
      updates.admin_override = sanitizeObject(payload.admin_override);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "output")) {
      updates.output = sanitizeObject(payload.output);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Ingen felter at opdatere." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
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
      return NextResponse.json({ message: error?.message || "Kunne ikke opdatere AI resultat." }, { status: 500 });
    }

    const item = await buildDetailItem(supabase, data as AiResultRow);
    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af AI resultat." }, { status: 500 });
  }
}
