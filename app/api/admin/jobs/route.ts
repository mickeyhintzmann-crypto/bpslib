import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { isJobService, isJobStatus, toIsoDateRange } from "@/lib/admin/jobs";
import { sendEmail } from "@/lib/notify/email";
import { buildJobNotificationTemplate } from "@/lib/notify/templates";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const JOBS_SCHEMA_MIGRATION = "supabase/migrations/20260302_000040_admin_jobs_calendar_schema.sql";

type EmployeeRelation = {
  id: string;
  name: string;
  role: string;
  is_active: boolean;
  calendar_color: string | null;
};

type JobRow = {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string | null;
  title: string;
  service: string | null;
  location: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  start_at: string;
  end_at: string;
  assigned_employee_id: string | null;
  employee: EmployeeRelation | EmployeeRelation[] | null;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const asOptionalString = (value: unknown) => {
  const text = asTrimmed(value);
  return text || null;
};

const isMissingTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

const asSingleRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) {
    return value[0] || null;
  }
  return value || null;
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

const toItem = (row: JobRow) => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  leadId: row.lead_id,
  title: row.title,
  service: row.service,
  location: row.location,
  address: row.address,
  notes: row.notes,
  status: row.status,
  startAt: row.start_at,
  endAt: row.end_at,
  assignedEmployeeId: row.assigned_employee_id,
  employee: asSingleRelation(row.employee)
    ? {
        id: asSingleRelation(row.employee)!.id,
        name: asSingleRelation(row.employee)!.name,
        role: asSingleRelation(row.employee)!.role,
        isActive: asSingleRelation(row.employee)!.is_active,
        calendarColor: asSingleRelation(row.employee)!.calendar_color
      }
    : null
});

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const statusFilterRaw = asTrimmed(url.searchParams.get("status"));
    const employeeId = asTrimmed(url.searchParams.get("employeeId"));
    const fromRaw = parseIsoDate(url.searchParams.get("from"));
    const toRaw = parseIsoDate(url.searchParams.get("to"));
    const { fromIso, toIso } = toIsoDateRange(fromRaw, toRaw);

    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("jobs")
      .select(
        "id, created_at, updated_at, lead_id, title, service, location, address, notes, status, start_at, end_at, assigned_employee_id, employee:assigned_employee_id(id,name,role,is_active,calendar_color)"
      )
      .gte("start_at", fromIso)
      .lte("start_at", toIso)
      .order("start_at", { ascending: true });

    if (statusFilterRaw && isJobStatus(statusFilterRaw)) {
      query = query.eq("status", statusFilterRaw);
    }

    if (employeeId) {
      query = query.eq("assigned_employee_id", employeeId);
    }

    const { data, error } = await query;

    if (error) {
      if (isMissingTable(error.message, "jobs")) {
        return NextResponse.json(
          {
            message: `Jobs-tabellen mangler. Kør migrationen ${JOBS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        items: ((data || []) as JobRow[]).map(toItem),
        range: { from: fromIso, to: toIso }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af jobs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const title = asTrimmed(payload.title);
    const status = asTrimmed(payload.status) || "unassigned";
    const serviceRaw = asTrimmed(payload.service);
    const startAtRaw = asTrimmed(payload.start_at);
    const endAtRaw = asTrimmed(payload.end_at);

    if (title.length < 2) {
      return NextResponse.json({ message: "Titel er påkrævet." }, { status: 400 });
    }

    if (!isJobStatus(status)) {
      return NextResponse.json({ message: "Ugyldig status." }, { status: 400 });
    }

    if (serviceRaw && !isJobService(serviceRaw)) {
      return NextResponse.json({ message: "Ugyldig service." }, { status: 400 });
    }

    const startAt = parseIsoDate(startAtRaw);
    const endAt = parseIsoDate(endAtRaw);
    if (!startAt || !endAt) {
      return NextResponse.json({ message: "Start og slut skal være gyldige datoer." }, { status: 400 });
    }

    if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      return NextResponse.json({ message: "Sluttid skal være efter starttid." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        title,
        service: serviceRaw || null,
        location: asOptionalString(payload.location),
        address: asOptionalString(payload.address),
        notes: asOptionalString(payload.notes),
        status,
        start_at: startAt,
        end_at: endAt,
        assigned_employee_id: asOptionalString(payload.assigned_employee_id),
        lead_id: asOptionalString(payload.lead_id)
      })
      .select(
        "id, created_at, updated_at, lead_id, title, service, location, address, notes, status, start_at, end_at, assigned_employee_id, employee:assigned_employee_id(id,name,role,is_active,calendar_color)"
      )
      .single();

    if (error || !data) {
      if (isMissingTable(error?.message, "jobs")) {
        return NextResponse.json(
          {
            message: `Jobs-tabellen mangler. Kør migrationen ${JOBS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke oprette job." }, { status: 500 });
    }

    if ((process.env.NOTIFY_JOBS_ENABLED || "").toLowerCase() === "true") {
      try {
        const row = data as JobRow;
        const employee = asSingleRelation(row.employee);
        const template = buildJobNotificationTemplate({
          action: "created",
          title: row.title,
          service: row.service,
          status: row.status,
          startAt: row.start_at,
          endAt: row.end_at,
          employeeName: employee?.name || null,
          location: row.location,
          address: row.address
        });
        const notifyResult = await sendEmail({
          subject: template.subject,
          html: template.html,
          text: template.text,
          enabled: true
        });
        if (!notifyResult.ok) {
          console.error("[job_notify] create email failed", notifyResult.error);
        }
      } catch (notifyError) {
        console.error("[job_notify] create email failed", notifyError);
      }
    }

    return NextResponse.json({ item: toItem(data as JobRow) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved oprettelse af job." }, { status: 500 });
  }
}
