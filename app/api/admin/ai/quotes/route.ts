import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  AI_CONTROL_ROOM_MIGRATION,
  AI_REVIEW_STATUS_VALUES,
  AI_SERVICES,
  asSingleRelation,
  asTrimmed,
  isMissingAiTable,
  parsePositiveInt,
  sanitizeObject
} from "@/lib/ai-estimator-control-room";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type AiLeadRelation = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
};

type AiRequestRelation = {
  id: string;
  created_at: string;
  service: string;
  lead_id: string | null;
  page_url: string | null;
  inputs: Record<string, unknown> | null;
  images: unknown[] | null;
  lead: AiLeadRelation | AiLeadRelation[] | null;
};

type AiResultRow = {
  id: string;
  created_at: string;
  request_id: string;
  output: Record<string, unknown> | null;
  confidence: number | null;
  needs_review: boolean;
  review_status: string;
  request: AiRequestRelation | AiRequestRelation[] | null;
};

const toBooleanFilter = (value: string | null) => {
  const normalized = asTrimmed(value).toLowerCase();
  if (!normalized || normalized === "alle") {
    return null;
  }
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }
  return null;
};

const truncate = (value: string, length: number) =>
  value.length > length ? `${value.slice(0, Math.max(0, length - 3))}...` : value;

const asJsonSearchText = (value: unknown) => {
  try {
    return JSON.stringify(value || {}).toLowerCase();
  } catch {
    return "";
  }
};

const summarizeOutput = (output: Record<string, unknown>) => {
  const textCandidate =
    asTrimmed(output.text) || asTrimmed(output.summary) || asTrimmed(output.explanation);
  if (textCandidate) {
    return truncate(textCandidate, 140);
  }

  const priceRange = sanitizeObject(output.price_range);
  const minRaw = priceRange.min ?? output.price_min ?? output.aiPriceMin;
  const maxRaw = priceRange.max ?? output.price_max ?? output.aiPriceMax;
  const min = typeof minRaw === "number" ? minRaw : Number(minRaw);
  const max = typeof maxRaw === "number" ? maxRaw : Number(maxRaw);

  if (!Number.isNaN(min) || !Number.isNaN(max)) {
    const hasMin = !Number.isNaN(min);
    const hasMax = !Number.isNaN(max);
    if (hasMin && hasMax) {
      return `Prisinterval: ${min.toLocaleString("da-DK")} - ${max.toLocaleString("da-DK")} kr.`;
    }
    if (hasMin) {
      return `Pris fra ${min.toLocaleString("da-DK")} kr.`;
    }
    return `Pris op til ${max.toLocaleString("da-DK")} kr.`;
  }

  const fallback = asJsonSearchText(output).replace(/[{}"]/g, " ").replace(/\s+/g, " ").trim();
  if (fallback) {
    return truncate(fallback, 140);
  }
  return "Ingen output endnu.";
};

const normalizeServiceFilter = (value: string | null) => {
  const cleaned = asTrimmed(value).toLowerCase();
  if (!cleaned || cleaned === "alle") {
    return null;
  }
  if (AI_SERVICES.includes(cleaned as (typeof AI_SERVICES)[number])) {
    return cleaned;
  }
  return null;
};

const normalizeReviewFilter = (value: string | null) => {
  const cleaned = asTrimmed(value).toLowerCase();
  if (!cleaned || cleaned === "alle") {
    return null;
  }
  if (AI_REVIEW_STATUS_VALUES.includes(cleaned as (typeof AI_REVIEW_STATUS_VALUES)[number])) {
    return cleaned;
  }
  return null;
};

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const serviceFilter = normalizeServiceFilter(url.searchParams.get("service"));
    const reviewStatusFilter = normalizeReviewFilter(url.searchParams.get("review_status"));
    const needsReviewFilter = toBooleanFilter(url.searchParams.get("needs_review"));
    const queryFilter = asTrimmed(url.searchParams.get("q")).toLowerCase();
    const page = parsePositiveInt(url.searchParams.get("page"), 1);
    const pageSize = Math.min(parsePositiveInt(url.searchParams.get("pageSize"), 25), 200);

    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("ai_quote_results")
      .select(
        "id, created_at, request_id, output, confidence, needs_review, review_status, request:request_id(id, created_at, service, lead_id, page_url, inputs, images, lead:lead_id(id, name, email, phone, location))"
      )
      .order("created_at", { ascending: false })
      .limit(2000);

    if (reviewStatusFilter) {
      query = query.eq("review_status", reviewStatusFilter);
    }
    if (typeof needsReviewFilter === "boolean") {
      query = query.eq("needs_review", needsReviewFilter);
    }

    const { data, error } = await query;
    if (error) {
      if (
        isMissingAiTable(error.message, "ai_quote_results") ||
        isMissingAiTable(error.message, "ai_quote_requests")
      ) {
        return NextResponse.json(
          {
            message: `AI control room-tabeller mangler. Kør migrationen ${AI_CONTROL_ROOM_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const rows = (data || []) as AiResultRow[];
    const filtered = rows
      .map((row) => {
        const requestItem = asSingleRelation(row.request);
        if (!requestItem) {
          return null;
        }
        const leadItem = asSingleRelation(requestItem.lead);
        const outputObject = sanitizeObject(row.output);

        if (serviceFilter && requestItem.service !== serviceFilter) {
          return null;
        }

        if (queryFilter) {
          const searchStack = [
            asTrimmed(leadItem?.name),
            asTrimmed(leadItem?.email),
            asTrimmed(leadItem?.phone),
            asTrimmed(leadItem?.location),
            asJsonSearchText(requestItem.inputs),
            asJsonSearchText(outputObject)
          ]
            .join(" ")
            .toLowerCase();

          if (!searchStack.includes(queryFilter)) {
            return null;
          }
        }

        return {
          result_id: row.id,
          created_at: row.created_at,
          service: requestItem.service,
          needs_review: row.needs_review,
          review_status: row.review_status,
          confidence: row.confidence,
          lead_id: requestItem.lead_id,
          lead: leadItem
            ? {
                name: leadItem.name,
                email: leadItem.email,
                phone: leadItem.phone,
                location: leadItem.location
              }
            : null,
          summary: summarizeOutput(outputObject)
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedItems = filtered.slice(startIndex, endIndex);

    return NextResponse.json({ items: pagedItems, total }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af AI quotes." }, { status: 500 });
  }
}
