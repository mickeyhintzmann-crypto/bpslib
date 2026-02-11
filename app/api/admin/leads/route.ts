import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const STATUS_FLOW = ["new", "contacted", "quote_sent", "won", "lost", "closed"] as const;
const SERVICE_VALUES = ["gulv", "toemrer", "maler", "murer", "andet"] as const;
const SOURCE_VALUES = ["tilbudstid", "kontakt"] as const;

type LeadRow = {
  id: string;
  created_at: string;
  source: string;
  service: string;
  name: string;
  phone: string;
  postal_code: string | null;
  status: string;
};

const isMissingLeadsTable = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes("could not find the table 'public.leads'") ||
    normalized.includes('relation "leads" does not exist')
  );
};

const normalizeStatusFilter = (raw: string | null) => {
  if (!raw || raw === "alle") {
    return null;
  }
  if (STATUS_FLOW.includes(raw as (typeof STATUS_FLOW)[number])) {
    return raw;
  }
  return null;
};

const normalizeServiceFilter = (raw: string | null) => {
  if (!raw || raw === "alle") {
    return null;
  }
  if (SERVICE_VALUES.includes(raw as (typeof SERVICE_VALUES)[number])) {
    return raw;
  }
  return null;
};

const normalizeSourceFilter = (raw: string | null) => {
  if (!raw || raw === "alle") {
    return null;
  }
  if (SOURCE_VALUES.includes(raw as (typeof SOURCE_VALUES)[number])) {
    return raw;
  }
  return null;
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
};

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const statusFilter = normalizeStatusFilter(url.searchParams.get("status"));
    const serviceFilter = normalizeServiceFilter(url.searchParams.get("service"));
    const sourceFilter = normalizeSourceFilter(url.searchParams.get("source"));
    const page = parsePositiveInt(url.searchParams.get("page"), 1);
    const pageSize = Math.min(parsePositiveInt(url.searchParams.get("limit"), 50), 200);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createSupabaseServiceClient();

    let query = supabase
      .from("leads")
      .select("id, created_at, source, service, name, phone, postal_code, status", {
        count: "exact"
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (statusFilter) {
      const values = statusFilter === "new" ? ["new", "Ny"] : [statusFilter];
      query = query.in("status", values);
    }

    if (serviceFilter) {
      query = query.eq("service", serviceFilter);
    }

    if (sourceFilter) {
      query = query.eq("source", sourceFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      if (isMissingLeadsTable(error.message)) {
        return NextResponse.json(
          {
            message:
              "Leads inbox er ikke klargjort i databasen endnu. Kør migrationen i supabase/migrations/20260208_000005_leads.sql."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const items = ((data || []) as LeadRow[]).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      source: row.source,
      service: row.service,
      name: row.name,
      phone: row.phone,
      postalCode: row.postal_code,
      status: row.status
    }));

    return NextResponse.json(
      {
        items,
        page,
        pageSize,
        total: count ?? null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl i leads inbox." }, { status: 500 });
  }
}
