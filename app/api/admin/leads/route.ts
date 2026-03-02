import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const STATUS_VALUES = ["new", "in_progress", "awaiting_customer", "won", "lost"] as const;
const SOURCE_VALUES = ["form", "ai_quote", "booking", "manual", "import"] as const;
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

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

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

const isMissingLeadsTable = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes("could not find the table 'public.leads'") ||
    normalized.includes('relation "leads" does not exist')
  );
};

const normalizeFilter = (value: string | null, accepted: readonly string[]) => {
  const cleaned = asTrimmed(value).toLowerCase();
  if (!cleaned || cleaned === "alle") {
    return null;
  }
  if (accepted.includes(cleaned)) {
    return cleaned;
  }
  return null;
};

const toItem = (row: LeadRow) => ({
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

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const statusFilter = normalizeFilter(url.searchParams.get("status"), STATUS_VALUES);
    const sourceFilter = normalizeFilter(url.searchParams.get("source"), SOURCE_VALUES);
    const serviceFilter = normalizeFilter(url.searchParams.get("service"), SERVICE_VALUES);
    const q = asTrimmed(url.searchParams.get("q"));
    const page = parsePositiveInt(url.searchParams.get("page"), 1);
    const pageSize = Math.min(parsePositiveInt(url.searchParams.get("pageSize"), 50), 200);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createSupabaseServiceClient();

    let query = supabase
      .from("leads")
      .select(
        "id, created_at, updated_at, status, source, service, name, email, phone, location, message, page_url, utm, meta",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    if (sourceFilter) {
      query = query.eq("source", sourceFilter);
    }

    if (serviceFilter) {
      query = query.eq("service", serviceFilter);
    }

    if (q) {
      const safeSearch = q.replace(/[(),%]/g, " ").trim();
      if (safeSearch) {
        query = query.or(
          `name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,phone.ilike.%${safeSearch}%,message.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%`
        );
      }
    }

    const { data, error, count } = await query;

    if (error) {
      if (isMissingLeadsTable(error.message)) {
        return NextResponse.json(
          {
            message: `Leads-tabellen mangler. Kør migrationen ${LEADS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        items: ((data || []) as LeadRow[]).map(toItem),
        page,
        pageSize,
        total: count ?? null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af leads." }, { status: 500 });
  }
}
