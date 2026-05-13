import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  AI_CONTROL_ROOM_MIGRATION,
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
  inputs: Record<string, unknown> | null;
  images: unknown[] | null;
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
};

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const serviceFilter = asTrimmed(url.searchParams.get("service")).toLowerCase();
    const limit = Math.min(parsePositiveInt(url.searchParams.get("limit"), 120), 300);

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("ai_quote_results")
      .select(
        "id, created_at, request_id, prompt_version_id, output, confidence, needs_review, review_status, admin_feedback, admin_override, request:request_id(id, created_at, service, lead_id, page_url, inputs, images)"
      )
      .or("needs_review.eq.true,review_status.eq.unreviewed")
      .order("created_at", { ascending: false })
      .limit(limit);

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

    const rows = ((data || []) as AiResultRow[]).filter((row) => {
      const requestItem = asSingleRelation(row.request);
      if (!requestItem) {
        return false;
      }
      if (serviceFilter && isAiService(serviceFilter) && requestItem.service !== serviceFilter) {
        return false;
      }
      return true;
    });

    const leadIds = Array.from(
      new Set(
        rows
          .map((row) => asSingleRelation(row.request)?.lead_id || null)
          .filter((id): id is string => Boolean(id))
      )
    );

    const leadsById = new Map<string, LeadRow>();
    if (leadIds.length > 0) {
      const { data: leadsData } = await supabase
        .from("leads")
        .select("id, name, email, phone, location")
        .in("id", leadIds);

      ((leadsData || []) as LeadRow[]).forEach((lead) => leadsById.set(lead.id, lead));
    }

    const items = rows.map((row) => {
      const requestItem = asSingleRelation(row.request)!;
      const lead = requestItem.lead_id ? leadsById.get(requestItem.lead_id) || null : null;
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
        lead: lead
          ? {
              id: lead.id,
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              location: lead.location
            }
          : null,
        request: {
          id: requestItem.id,
          createdAt: requestItem.created_at,
          pageUrl: requestItem.page_url,
          inputs: sanitizeObject(requestItem.inputs),
          images: requestItem.images || []
        },
        output: sanitizeObject(row.output),
        adminFeedback: row.admin_feedback,
        adminOverride: sanitizeObject(row.admin_override)
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af AI queue." }, { status: 500 });
  }
}
