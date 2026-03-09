import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const STATUS_VALUES = ["new", "in_progress", "awaiting_customer", "won", "lost"] as const;
const SERVICE_VALUES = [
  "bordplade",
  "gulvafslibning",
  "gulvbelaegning",
  "microcement",
  "maler",
  "toemrer",
  "murer",
  "andet"
] as const;

const LEADS_SCHEMA_MIGRATION = "supabase/migrations/20260302000030_admin_leads_schema.sql";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type LeadRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  source: string;
  service: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
  page_url: string | null;
  utm: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
};

type LeadMessageRow = {
  id: string;
  lead_id: string;
  created_at: string;
  kind: string;
  channel: string;
  content: string;
  created_by: string | null;
};

type AiQuoteRequestRow = {
  id: string;
  created_at: string;
  service: string;
  page_url: string | null;
};

type AiQuoteResultRow = {
  id: string;
  created_at: string;
  confidence: number | null;
  needs_review: boolean;
  review_status: string;
  output: Record<string, unknown> | null;
  admin_override: Record<string, unknown> | null;
};

type BookingRow = {
  id: string;
  created_at: string;
  status: string | null;
  source: string | null;
  date: string | null;
  start_slot_index: number | null;
  slot_count: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  address: string | null;
  postal_code: string | null;
  notes: string | null;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const asUuidOrNull = (value: string | null | undefined) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || "")
    ? value
    : null;

const asObject = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

const isMissingTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
};

const toLeadItem = (row: LeadRow) => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  status: row.status,
  source: row.source,
  service: row.service,
  name: row.name,
  email: row.email,
  phone: row.phone,
  location: row.location,
  message: row.message,
  pageUrl: row.page_url,
  utm: row.utm || {},
  meta: row.meta || {}
});

const toMessageItem = (row: LeadMessageRow) => ({
  id: row.id,
  leadId: row.lead_id,
  createdAt: row.created_at,
  kind: row.kind,
  channel: row.channel,
  content: row.content,
  createdBy: row.created_by
});

const asNumberOrNull = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const extractPriceRange = (result: AiQuoteResultRow | null) => {
  if (!result) {
    return { min: null as number | null, max: null as number | null };
  }

  const output = asObject(result.output) || {};
  const override = asObject(result.admin_override) || {};
  const outputPriceRange = asObject(output.price_range) || {};
  const overridePriceRange = asObject(override.price_range) || {};

  const min =
    asNumberOrNull(overridePriceRange.min) ??
    asNumberOrNull(override.price_min) ??
    asNumberOrNull(outputPriceRange.min) ??
    asNumberOrNull(output.price_min);
  const max =
    asNumberOrNull(overridePriceRange.max) ??
    asNumberOrNull(override.price_max) ??
    asNumberOrNull(outputPriceRange.max) ??
    asNumberOrNull(output.price_max);

  return { min, max };
};

const summarizeAiOutput = (result: AiQuoteResultRow | null) => {
  if (!result) {
    return null;
  }

  const output = asObject(result.output) || {};
  const candidate =
    asTrimmed(output.summary) || asTrimmed(output.text) || asTrimmed(output.explanation);
  if (!candidate) {
    return null;
  }
  return candidate.length > 220 ? `${candidate.slice(0, 217)}...` : candidate;
};

const fetchLeadContext = async (
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  lead: LeadRow
) => {
  const meta = asObject(lead.meta) || {};
  const bookingId = asUuidOrNull(asTrimmed(meta.bookingId));
  const estimatorRequestId = asUuidOrNull(asTrimmed(meta.estimatorRequestId));

  let aiQuote: {
    requestId: string;
    resultId: string | null;
    createdAt: string;
    service: string;
    pageUrl: string | null;
    reviewStatus: string | null;
    confidence: number | null;
    needsReview: boolean | null;
    priceMin: number | null;
    priceMax: number | null;
    summary: string | null;
  } | null = null;

  let booking: {
    id: string;
    createdAt: string;
    status: string | null;
    source: string | null;
    date: string | null;
    startSlotIndex: number | null;
    slotCount: number | null;
    customerName: string | null;
    customerPhone: string | null;
    customerEmail: string | null;
    address: string | null;
    postalCode: string | null;
    notes: string | null;
  } | null = null;

  const shouldFetchAi = lead.source === "ai_quote" || Boolean(estimatorRequestId);
  if (shouldFetchAi) {
    let requestRow: AiQuoteRequestRow | null = null;

    if (estimatorRequestId) {
      const estimatorRequest = await supabase
        .from("ai_quote_requests")
        .select("id, created_at, service, page_url")
        .eq("id", estimatorRequestId)
        .maybeSingle();
      if (!estimatorRequest.error && estimatorRequest.data) {
        requestRow = estimatorRequest.data as AiQuoteRequestRow;
      }
    }

    if (!requestRow) {
      const latestByLead = await supabase
        .from("ai_quote_requests")
        .select("id, created_at, service, page_url")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!latestByLead.error && latestByLead.data) {
        requestRow = latestByLead.data as AiQuoteRequestRow;
      }
    }

    if (requestRow) {
      let resultRow: AiQuoteResultRow | null = null;
      const latestResult = await supabase
        .from("ai_quote_results")
        .select("id, created_at, confidence, needs_review, review_status, output, admin_override")
        .eq("request_id", requestRow.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!latestResult.error && latestResult.data) {
        resultRow = latestResult.data as AiQuoteResultRow;
      }

      const { min, max } = extractPriceRange(resultRow);
      aiQuote = {
        requestId: requestRow.id,
        resultId: resultRow?.id || null,
        createdAt: requestRow.created_at,
        service: requestRow.service,
        pageUrl: requestRow.page_url,
        reviewStatus: resultRow?.review_status || null,
        confidence: resultRow?.confidence ?? null,
        needsReview: typeof resultRow?.needs_review === "boolean" ? resultRow.needs_review : null,
        priceMin: min,
        priceMax: max,
        summary: summarizeAiOutput(resultRow)
      };
    }
  }

  const shouldFetchBooking = lead.source === "booking" || Boolean(bookingId);
  if (shouldFetchBooking) {
    let bookingRow: BookingRow | null = null;

    if (bookingId) {
      const linkedBooking = await supabase
        .from("bookings")
        .select(
          "id, created_at, status, source, date, start_slot_index, slot_count, customer_name, customer_phone, customer_email, address, postal_code, notes"
        )
        .eq("id", bookingId)
        .maybeSingle();
      if (!linkedBooking.error && linkedBooking.data) {
        bookingRow = linkedBooking.data as BookingRow;
      }
    }

    if (!bookingRow) {
      const phone = asTrimmed(lead.phone);
      if (phone) {
        const latestByPhone = await supabase
          .from("bookings")
          .select(
            "id, created_at, status, source, date, start_slot_index, slot_count, customer_name, customer_phone, customer_email, address, postal_code, notes"
          )
          .eq("customer_phone", phone)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!latestByPhone.error && latestByPhone.data) {
          bookingRow = latestByPhone.data as BookingRow;
        }
      }
    }

    if (bookingRow) {
      booking = {
        id: bookingRow.id,
        createdAt: bookingRow.created_at,
        status: bookingRow.status,
        source: bookingRow.source,
        date: bookingRow.date,
        startSlotIndex: bookingRow.start_slot_index,
        slotCount: bookingRow.slot_count,
        customerName: bookingRow.customer_name,
        customerPhone: bookingRow.customer_phone,
        customerEmail: bookingRow.customer_email,
        address: bookingRow.address,
        postalCode: bookingRow.postal_code,
        notes: bookingRow.notes
      };
    }
  }

  return { aiQuote, booking };
};

const fetchLeadWithMessages = async (
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  id: string
) => {
  const [leadResult, messagesResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id, created_at, updated_at, status, source, service, name, email, phone, location, message, page_url, utm, meta")
      .eq("id", id)
      .single(),
    supabase
      .from("lead_messages")
      .select("id, lead_id, created_at, kind, channel, content, created_by")
      .eq("lead_id", id)
      .order("created_at", { ascending: true })
  ]);

  return {
    lead: leadResult,
    messages: messagesResult
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
      return NextResponse.json({ message: "Mangler lead-id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { lead, messages } = await fetchLeadWithMessages(supabase, id);

    if (lead.error || !lead.data) {
      if (isMissingTable(lead.error?.message, "leads")) {
        return NextResponse.json(
          {
            message: `Leads-tabellen mangler. Kør migrationen ${LEADS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: lead.error?.message || "Lead blev ikke fundet." }, { status: 404 });
    }

    if (messages.error) {
      if (isMissingTable(messages.error.message, "lead_messages")) {
        return NextResponse.json(
          {
            message: `Lead_messages-tabellen mangler. Kør migrationen ${LEADS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: messages.error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        item: toLeadItem(lead.data as LeadRow),
        context: await fetchLeadContext(supabase, lead.data as LeadRow),
        messages: ((messages.data || []) as LeadMessageRow[]).map(toMessageItem)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af lead." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler lead-id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const status = asTrimmed(payload.status);
    const service = asTrimmed(payload.service);
    const note = asTrimmed(payload.note);
    const metaPatch = asObject(payload.meta);

    if (status && !STATUS_VALUES.includes(status as (typeof STATUS_VALUES)[number])) {
      return NextResponse.json({ message: "Ugyldig status." }, { status: 400 });
    }

    if (service && !SERVICE_VALUES.includes(service as (typeof SERVICE_VALUES)[number])) {
      return NextResponse.json({ message: "Ugyldig service." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: existingLead, error: existingError } = await supabase
      .from("leads")
      .select("id, meta")
      .eq("id", id)
      .single();

    if (existingError || !existingLead) {
      if (isMissingTable(existingError?.message, "leads")) {
        return NextResponse.json(
          {
            message: `Leads-tabellen mangler. Kør migrationen ${LEADS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ message: existingError?.message || "Lead blev ikke fundet." }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (status) {
      updates.status = status;
    }

    if (service) {
      updates.service = service;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "assigned_to")) {
      const assignedTo = asTrimmed(payload.assigned_to);
      const currentMeta = asObject(existingLead.meta) || {};
      updates.meta = {
        ...currentMeta,
        assigned_to: assignedTo || null
      };
    }

    if (metaPatch) {
      const currentMeta = (updates.meta as Record<string, unknown>) || asObject(existingLead.meta) || {};
      updates.meta = {
        ...currentMeta,
        ...metaPatch
      };
    }

    let updatedLead: LeadRow | null = null;

    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select(
          "id, created_at, updated_at, status, source, service, name, email, phone, location, message, page_url, utm, meta"
        )
        .single();

      if (error || !data) {
        return NextResponse.json({ message: error?.message || "Kunne ikke opdatere lead." }, { status: 500 });
      }

      updatedLead = data as LeadRow;
    }

    if (note) {
      const { error: noteError } = await supabase.from("lead_messages").insert({
        lead_id: id,
        kind: "note",
        channel: "admin",
        content: note,
        created_by: asUuidOrNull(session?.id)
      });

      if (noteError) {
        if (isMissingTable(noteError.message, "lead_messages")) {
          return NextResponse.json(
            {
              message: `Lead_messages-tabellen mangler. Kør migrationen ${LEADS_SCHEMA_MIGRATION}.`
            },
            { status: 503 }
          );
        }
        return NextResponse.json({ message: noteError.message || "Kunne ikke oprette note." }, { status: 500 });
      }
    }

    if (!updatedLead) {
      const { lead } = await fetchLeadWithMessages(supabase, id);
      if (!lead.data) {
        return NextResponse.json({ message: "Lead blev ikke fundet efter opdatering." }, { status: 404 });
      }
      updatedLead = lead.data as LeadRow;
    }

    const { messages } = await fetchLeadWithMessages(supabase, id);

    if (messages.error) {
      return NextResponse.json({ message: messages.error.message || "Kunne ikke hente beskeder." }, { status: 500 });
    }

    return NextResponse.json(
      {
        item: toLeadItem(updatedLead),
        messages: ((messages.data || []) as LeadMessageRow[]).map(toMessageItem)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af lead." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler lead-id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("leads").delete().eq("id", id).select("id").single();

    if (error || !data) {
      if (isMissingTable(error?.message, "leads")) {
        return NextResponse.json(
          {
            message: `Leads-tabellen mangler. Kør migrationen ${LEADS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke slette lead." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved sletning af lead." }, { status: 500 });
  }
}
