import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { isJobService, isJobStatus } from "@/lib/admin/jobs";
import { sendEmail } from "@/lib/notify/email";
import { buildJobNotificationTemplate } from "@/lib/notify/templates";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const JOBS_SCHEMA_MIGRATION = "supabase/migrations/20260302_000040_admin_jobs_calendar_schema.sql";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type EmployeeRelation = {
  id: string;
  name: string;
  role: string;
  is_active: boolean;
  calendar_color: string | null;
};

type LeadRelation = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
  source: string | null;
  service: string | null;
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
  lead: LeadRelation | LeadRelation[] | null;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const asOptionalString = (value: unknown) => {
  const text = asTrimmed(value);
  return text || null;
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

const toItem = (row: JobRow) => {
  const employee = asSingleRelation(row.employee);
  const lead = asSingleRelation(row.lead);

  return {
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
    employee: employee
      ? {
          id: employee.id,
          name: employee.name,
          role: employee.role,
          isActive: employee.is_active,
          calendarColor: employee.calendar_color
        }
      : null,
    lead: lead
      ? {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          location: lead.location,
          message: lead.message,
          source: lead.source,
          service: lead.service
        }
      : null
  };
};

const JOB_SELECT =
  "id, created_at, updated_at, lead_id, title, service, location, address, notes, status, start_at, end_at, assigned_employee_id, employee:assigned_employee_id(id,name,role,is_active,calendar_color), lead:lead_id(id,name,email,phone,location,message,source,service)";

const PATCH_NOTIFY_FIELDS = ["assigned_employee_id", "start_at", "end_at", "status"] as const;

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler job-id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("jobs").select(JOB_SELECT).eq("id", id).single();

    if (error || !data) {
      if (isMissingTable(error?.message, "jobs")) {
        return NextResponse.json(
          {
            message: `Jobs-tabellen mangler. Kør migrationen ${JOBS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke hente job." }, { status: 404 });
    }

    return NextResponse.json({ item: toItem(data as JobRow) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af job." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler job-id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(payload, "title")) {
      const title = asTrimmed(payload.title);
      if (title.length < 2) {
        return NextResponse.json({ message: "Titel er påkrævet." }, { status: 400 });
      }
      updates.title = title;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "status")) {
      const status = asTrimmed(payload.status);
      if (!isJobStatus(status)) {
        return NextResponse.json({ message: "Ugyldig status." }, { status: 400 });
      }
      updates.status = status;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "service")) {
      const service = asTrimmed(payload.service);
      if (service && !isJobService(service)) {
        return NextResponse.json({ message: "Ugyldig service." }, { status: 400 });
      }
      updates.service = service || null;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "location")) {
      updates.location = asOptionalString(payload.location);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "address")) {
      updates.address = asOptionalString(payload.address);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "notes")) {
      updates.notes = asOptionalString(payload.notes);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "assigned_employee_id")) {
      updates.assigned_employee_id = asOptionalString(payload.assigned_employee_id);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "lead_id")) {
      updates.lead_id = asOptionalString(payload.lead_id);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "start_at")) {
      const startAt = parseIsoDate(asTrimmed(payload.start_at));
      if (!startAt) {
        return NextResponse.json({ message: "Ugyldig startdato." }, { status: 400 });
      }
      updates.start_at = startAt;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "end_at")) {
      const endAt = parseIsoDate(asTrimmed(payload.end_at));
      if (!endAt) {
        return NextResponse.json({ message: "Ugyldig slutdato." }, { status: 400 });
      }
      updates.end_at = endAt;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Ingen felter at opdatere." }, { status: 400 });
    }

    const shouldNotifyPatch = PATCH_NOTIFY_FIELDS.some((key) =>
      Object.prototype.hasOwnProperty.call(updates, key)
    );

    const supabase = createSupabaseServiceClient();

    if (Object.prototype.hasOwnProperty.call(updates, "start_at") || Object.prototype.hasOwnProperty.call(updates, "end_at")) {
      const { data: current, error: currentError } = await supabase
        .from("jobs")
        .select("start_at, end_at")
        .eq("id", id)
        .single();

      if (currentError || !current) {
        return NextResponse.json({ message: currentError?.message || "Kunne ikke hente aktuelt job." }, { status: 404 });
      }

      const nextStart = String(updates.start_at || current.start_at);
      const nextEnd = String(updates.end_at || current.end_at);
      if (new Date(nextEnd).getTime() <= new Date(nextStart).getTime()) {
        return NextResponse.json({ message: "Sluttid skal være efter starttid." }, { status: 400 });
      }
    }

    const { data, error } = await supabase.from("jobs").update(updates).eq("id", id).select(JOB_SELECT).single();

    if (error || !data) {
      if (isMissingTable(error?.message, "jobs")) {
        return NextResponse.json(
          {
            message: `Jobs-tabellen mangler. Kør migrationen ${JOBS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke opdatere job." }, { status: 500 });
    }

    if (shouldNotifyPatch && (process.env.NOTIFY_JOBS_ENABLED || "").toLowerCase() === "true") {
      try {
        const row = data as JobRow;
        const employee = asSingleRelation(row.employee);
        const template = buildJobNotificationTemplate({
          action: "updated",
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
          console.error("[job_notify] patch email failed", notifyResult.error);
        }
      } catch (notifyError) {
        console.error("[job_notify] patch email failed", notifyError);
      }
    }

    return NextResponse.json({ item: toItem(data as JobRow) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af job." }, { status: 500 });
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
      return NextResponse.json({ message: "Mangler job-id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from("jobs").delete().eq("id", id).select("id").single();

    if (error || !data) {
      if (isMissingTable(error?.message, "jobs")) {
        return NextResponse.json(
          {
            message: `Jobs-tabellen mangler. Kør migrationen ${JOBS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke slette job." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved sletning af job." }, { status: 500 });
  }
}
