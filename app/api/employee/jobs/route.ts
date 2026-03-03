import { NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { toIsoDateRange } from "@/lib/admin/jobs";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const EMPLOYEE_PORTAL_MIGRATION = "supabase/migrations/20260304_000070_employee_portal_email.sql";

type EmployeeRow = {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
};

type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
};

type JobRow = {
  id: string;
  title: string;
  service: string | null;
  status: string;
  start_at: string;
  end_at: string;
  location: string | null;
  address: string | null;
  notes: string | null;
  lead_id: string | null;
  lead: LeadRow | LeadRow[] | null;
};

type AiQuoteRequestRow = {
  id: string;
  lead_id: string | null;
  created_at: string;
};

type AiQuoteResultRow = {
  request_id: string;
  created_at: string;
  output: Record<string, unknown> | null;
  admin_override: Record<string, unknown> | null;
};

const asSingleRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) {
    return value[0] || null;
  }
  return value || null;
};

const isMissingTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

const isMissingColumn = (message: string | undefined, table: string, column: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`column ${table}.${column} does not exist`) ||
    normalized.includes(`column \"${column}\" of relation \"${table}\" does not exist`) ||
    normalized.includes(`could not find the '${column}' column of '${table}'`)
  );
};

const parseIsoDate = (value: string | null) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

const parseSampleNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    let normalized = value.trim();
    if (!normalized) {
      return null;
    }
    normalized = normalized.replace(/[^\d.,]/g, "");
    if (!normalized) {
      return null;
    }
    if (normalized.includes(",")) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/\./g, "");
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parsePriceRange = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { min: null as number | null, max: null as number | null };
  }
  const obj = value as Record<string, unknown>;
  const range =
    obj.price_range && typeof obj.price_range === "object" && !Array.isArray(obj.price_range)
      ? (obj.price_range as Record<string, unknown>)
      : {};

  const min = parseSampleNumber(range.min ?? obj.price_min);
  const max = parseSampleNumber(range.max ?? obj.price_max);
  return { min, max };
};

const formatPriceRange = (min: number | null, max: number | null) => {
  if (typeof min === "number" && typeof max === "number") {
    return `${Math.round(min).toLocaleString("da-DK")} - ${Math.round(max).toLocaleString("da-DK")} kr.`;
  }
  if (typeof min === "number") {
    return `Fra ${Math.round(min).toLocaleString("da-DK")} kr.`;
  }
  if (typeof max === "number") {
    return `Op til ${Math.round(max).toLocaleString("da-DK")} kr.`;
  }
  return "Ikke angivet";
};

const buildMapsUrl = (address: string | null, location: string | null) => {
  const query = [address, location].filter(Boolean).join(", ");
  if (!query) {
    return null;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const getSessionEmployee = async (request: Request) => {
  const session = getAdminSessionFromRequest(request);
  if (!session || session.role !== "employee") {
    return { error: NextResponse.json({ message: "Ingen adgang." }, { status: 401 }), employee: null };
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("employees")
    .select("id, name, email, is_active")
    .ilike("email", session.email)
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingColumn(error.message, "employees", "email")) {
      return {
        error: NextResponse.json(
          { message: `Employees-email mangler. Kør migrationen ${EMPLOYEE_PORTAL_MIGRATION}.` },
          { status: 503 }
        ),
        employee: null
      };
    }
    if (isMissingTable(error.message, "employees")) {
      return {
        error: NextResponse.json(
          { message: "Employees-tabellen mangler. Kør jobs-migrationen i Supabase." },
          { status: 503 }
        ),
        employee: null
      };
    }
    return { error: NextResponse.json({ message: error.message }, { status: 500 }), employee: null };
  }

  if (!data || (data as EmployeeRow).is_active === false) {
    return {
      error: NextResponse.json(
        { message: "Din medarbejderprofil mangler eller er inaktiv. Kontakt administrator." },
        { status: 403 }
      ),
      employee: null
    };
  }

  return { error: null, employee: data as EmployeeRow };
};

export async function GET(request: Request) {
  try {
    const { error: sessionError, employee } = await getSessionEmployee(request);
    if (sessionError || !employee) {
      return sessionError;
    }

    const url = new URL(request.url);
    const fromRaw = parseIsoDate(url.searchParams.get("from"));
    const toRaw = parseIsoDate(url.searchParams.get("to"));
    const { fromIso, toIso } = toIsoDateRange(fromRaw, toRaw);

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, title, service, status, start_at, end_at, location, address, notes, lead_id, lead:lead_id(id,name,email,phone,location,message)"
      )
      .eq("assigned_employee_id", employee.id)
      .gte("start_at", fromIso)
      .lte("start_at", toIso)
      .order("start_at", { ascending: true });

    if (error) {
      if (isMissingTable(error.message, "jobs")) {
        return NextResponse.json(
          { message: "Jobs-tabellen mangler. Kør jobs-migrationen i Supabase." },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const jobs = ((data || []) as JobRow[]).map((row) => ({
      ...row,
      lead: asSingleRelation(row.lead)
    }));

    const leadIds = [...new Set(jobs.map((job) => job.lead_id).filter((id): id is string => Boolean(id)))];
    const priceByLeadId = new Map<string, { min: number | null; max: number | null }>();

    if (leadIds.length > 0) {
      const { data: requestRows } = await supabase
        .from("ai_quote_requests")
        .select("id, lead_id, created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: false });

      const latestRequestByLead = new Map<string, AiQuoteRequestRow>();
      ((requestRows || []) as AiQuoteRequestRow[]).forEach((row) => {
        if (!row.lead_id || latestRequestByLead.has(row.lead_id)) {
          return;
        }
        latestRequestByLead.set(row.lead_id, row);
      });

      const requestIds = [...latestRequestByLead.values()].map((row) => row.id);
      if (requestIds.length > 0) {
        const { data: resultRows } = await supabase
          .from("ai_quote_results")
          .select("request_id, created_at, output, admin_override")
          .in("request_id", requestIds)
          .order("created_at", { ascending: false });

        const latestResultByRequest = new Map<string, AiQuoteResultRow>();
        ((resultRows || []) as AiQuoteResultRow[]).forEach((row) => {
          if (latestResultByRequest.has(row.request_id)) {
            return;
          }
          latestResultByRequest.set(row.request_id, row);
        });

        latestRequestByLead.forEach((requestRow, leadId) => {
          const resultRow = latestResultByRequest.get(requestRow.id);
          if (!resultRow) {
            return;
          }
          const overrideRange = parsePriceRange(resultRow.admin_override);
          const outputRange = parsePriceRange(resultRow.output);
          priceByLeadId.set(leadId, {
            min: overrideRange.min ?? outputRange.min ?? null,
            max: overrideRange.max ?? outputRange.max ?? null
          });
        });
      }
    }

    const items = jobs.map((job) => {
      const lead = job.lead as LeadRow | null;
      const price = job.lead_id ? priceByLeadId.get(job.lead_id) : undefined;
      const mapsUrl = buildMapsUrl(job.address, job.location || lead?.location || null);

      return {
        id: job.id,
        title: job.title,
        service: job.service,
        status: job.status,
        startAt: job.start_at,
        endAt: job.end_at,
        location: job.location,
        address: job.address,
        notes: job.notes,
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
        priceMin: price?.min ?? null,
        priceMax: price?.max ?? null,
        priceLabel: formatPriceRange(price?.min ?? null, price?.max ?? null),
        mapsUrl
      };
    });

    return NextResponse.json(
      {
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email
        },
        range: { from: fromIso, to: toIso },
        items
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af medarbejderjobs." }, { status: 500 });
  }
}
