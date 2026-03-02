import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  AI_CONTROL_ROOM_MIGRATION,
  AI_REVIEW_STATUS_VALUES,
  asSingleRelation,
  asTrimmed,
  isAiService,
  isMissingAiTable,
  parsePositiveInt,
  sanitizeObject,
  summarizeOutput
} from "@/lib/ai-estimator-control-room";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type AiRequestRelation = {
  id: string;
  created_at: string;
  service: string;
  lead_id: string | null;
  page_url: string | null;
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

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const serviceFilter = asTrimmed(url.searchParams.get("service")).toLowerCase();
    const reviewFilter = asTrimmed(url.searchParams.get("status")).toLowerCase();
    const limit = Math.min(parsePositiveInt(url.searchParams.get("limit"), 100), 300);

    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("ai_quote_results")
      .select(
        "id, created_at, request_id, prompt_version_id, output, confidence, needs_review, review_status, admin_feedback, admin_override, request:request_id(id, created_at, service, lead_id, page_url)"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (reviewFilter && AI_REVIEW_STATUS_VALUES.includes(reviewFilter as (typeof AI_REVIEW_STATUS_VALUES)[number])) {
      query = query.eq("review_status", reviewFilter);
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

    const items = ((data || []) as AiResultRow[])
      .map((row) => {
        const requestItem = asSingleRelation(row.request);
        if (!requestItem) {
          return null;
        }
        if (serviceFilter && isAiService(serviceFilter) && requestItem.service !== serviceFilter) {
          return null;
        }
        return {
          id: row.id,
          createdAt: row.created_at,
          requestId: row.request_id,
          promptVersionId: row.prompt_version_id,
          service: requestItem.service,
          reviewStatus: row.review_status,
          needsReview: row.needs_review,
          confidence: row.confidence,
          summary: summarizeOutput(row.output),
          request: {
            id: requestItem.id,
            createdAt: requestItem.created_at,
            leadId: requestItem.lead_id,
            pageUrl: requestItem.page_url
          },
          output: sanitizeObject(row.output),
          adminFeedback: row.admin_feedback,
          adminOverride: sanitizeObject(row.admin_override)
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af AI history." }, { status: 500 });
  }
}
