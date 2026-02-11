import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const STATUS_FLOW = ["new", "contacted", "quote_sent", "won", "lost", "closed"] as const;

type LeadRow = {
  id: string;
  created_at: string;
  source: string;
  service: string;
  name: string;
  phone: string;
  postal_code: string | null;
  note: string | null;
  message?: string | null;
  status: string;
  internal_note: string | null;
  email?: string | null;
};

type UpdatePayload = {
  status?: unknown;
  internalNote?: unknown;
};

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

const isMissingLeadsTable = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes("could not find the table 'public.leads'") ||
    normalized.includes('relation "leads" does not exist')
  );
};

const isMissingColumn = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return normalized.includes("column") && normalized.includes("does not exist");
};

const isKnownStatus = (value: unknown): value is (typeof STATUS_FLOW)[number] =>
  typeof value === "string" && STATUS_FLOW.includes(value as (typeof STATUS_FLOW)[number]);

const mapLeadRow = (row: LeadRow) => ({
  id: row.id,
  createdAt: row.created_at,
  source: row.source,
  service: row.service,
  name: row.name,
  phone: row.phone,
  email: typeof row.email === "string" ? row.email : null,
  postalCode: row.postal_code,
  note: row.message || row.note,
  status: row.status,
  internalNote: row.internal_note
});

export async function GET(request: Request, context: RouteContext) {
  try {
    const { error } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (error) {
      return error;
    }

    const params = await Promise.resolve(context.params);

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase.from("leads").select("*").eq("id", params.id).single();

    if (error || !data) {
      if (isMissingLeadsTable(error?.message)) {
        return NextResponse.json(
          {
            message:
              "Leads inbox er ikke klargjort i databasen endnu. Kør migrationen i supabase/migrations/20260208_000005_leads.sql."
          },
          { status: 503 }
        );
      }
      if (error?.code === "PGRST116") {
        return NextResponse.json({ message: "Lead blev ikke fundet." }, { status: 404 });
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke hente lead." }, { status: 500 });
    }

    return NextResponse.json({ item: mapLeadRow(data as LeadRow) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af lead." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { session, error } = requireAdmin(request, ["owner", "admin"]);
    if (error) {
      return error;
    }

    const params = await Promise.resolve(context.params);
    const payload = (await request.json()) as UpdatePayload;

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ message: "Ugyldigt payload." }, { status: 400 });
    }

    const updateData: Record<string, string | null> = {};

    if ("status" in payload) {
      if (!isKnownStatus(payload.status)) {
        return NextResponse.json({ message: "Ugyldig status." }, { status: 400 });
      }
      updateData.status = payload.status;
    }

    if ("internalNote" in payload) {
      if (payload.internalNote === null || payload.internalNote === "") {
        updateData.internal_note = null;
      } else if (typeof payload.internalNote === "string") {
        updateData.internal_note = payload.internalNote.trim();
      } else {
        return NextResponse.json({ message: "Intern note skal være tekst." }, { status: 400 });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Ingen felter at opdatere." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: beforeData } = await supabase.from("leads").select("*").eq("id", params.id).single();

    const { data, error } = await supabase
      .from("leads")
      .update(updateData)
      .eq("id", params.id)
      .select("*")
      .single();

    if (error || !data) {
      if (isMissingLeadsTable(error?.message)) {
        return NextResponse.json(
          {
            message:
              "Leads inbox er ikke klargjort i databasen endnu. Kør migrationen i supabase/migrations/20260208_000005_leads.sql."
          },
          { status: 503 }
        );
      }
      if (isMissingColumn(error?.message)) {
        return NextResponse.json(
          {
            message:
              "Intern note mangler i databasen. Kør migrationen i supabase/migrations/20260208_000006_leads_internal_note.sql."
          },
          { status: 503 }
        );
      }
      if (error?.code === "PGRST116") {
        return NextResponse.json({ message: "Lead blev ikke fundet." }, { status: 404 });
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke opdatere lead." }, { status: 500 });
    }

    await auditLog({
      action: "lead.update",
      entityType: "lead",
      entityId: data.id,
      meta: {
        before: beforeData || null,
        after: data,
        changes: updateData
      },
      req: request,
      actor: session?.email,
      role: session?.role
    });

    return NextResponse.json({ item: mapLeadRow(data as LeadRow) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af lead." }, { status: 500 });
  }
}
