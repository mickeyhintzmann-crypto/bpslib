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

const LEADS_SCHEMA_MIGRATION = "supabase/migrations/20260302_000030_admin_leads_schema.sql";

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
