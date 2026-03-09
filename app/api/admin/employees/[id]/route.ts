import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const JOBS_SCHEMA_MIGRATION = "supabase/migrations/20260302000040_admin_jobs_calendar_schema.sql";
const EMPLOYEE_PORTAL_MIGRATION = "supabase/migrations/20260304000070_employee_portal_email.sql";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type EmployeeRow = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  role: string;
  is_active: boolean;
  calendar_color: string | null;
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

const isMissingColumn = (message: string | undefined, table: string, column: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`column ${table}.${column} does not exist`) ||
    normalized.includes(`column \"${column}\" of relation \"${table}\" does not exist`) ||
    normalized.includes(`could not find the '${column}' column of '${table}'`)
  );
};

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
};

const toItem = (row: EmployeeRow) => ({
  id: row.id,
  createdAt: row.created_at,
  name: row.name,
  email: row.email,
  role: row.role,
  isActive: row.is_active,
  calendarColor: row.calendar_color
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler medarbejder-id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(payload, "name")) {
      const name = asTrimmed(payload.name);
      if (name.length < 2) {
        return NextResponse.json({ message: "Navn er påkrævet." }, { status: 400 });
      }
      updates.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "role")) {
      updates.role = asTrimmed(payload.role) || "worker";
    }

    if (Object.prototype.hasOwnProperty.call(payload, "email")) {
      updates.email = asOptionalString(payload.email)?.toLowerCase() || null;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "calendar_color")) {
      updates.calendar_color = asOptionalString(payload.calendar_color);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "is_active")) {
      updates.is_active = payload.is_active === true;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Ingen felter at opdatere." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("employees")
      .update(updates)
      .eq("id", id)
      .select("id, created_at, name, email, role, is_active, calendar_color")
      .single();

    if (error || !data) {
      if (isMissingColumn(error?.message, "employees", "email")) {
        return NextResponse.json(
          { message: `Employees-email mangler. Kør migrationen ${EMPLOYEE_PORTAL_MIGRATION}.` },
          { status: 503 }
        );
      }
      if (isMissingTable(error?.message, "employees")) {
        return NextResponse.json(
          {
            message: `Employees-tabellen mangler. Kør migrationen ${JOBS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ message: error?.message || "Kunne ikke opdatere medarbejder." }, { status: 500 });
    }

    return NextResponse.json({ item: toItem(data as EmployeeRow) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af medarbejder." }, { status: 500 });
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
      return NextResponse.json({ message: "Mangler medarbejder-id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("employees")
      .update({ is_active: false })
      .eq("id", id)
      .select("id, created_at, name, email, role, is_active, calendar_color")
      .single();

    if (error || !data) {
      if (isMissingColumn(error?.message, "employees", "email")) {
        return NextResponse.json(
          { message: `Employees-email mangler. Kør migrationen ${EMPLOYEE_PORTAL_MIGRATION}.` },
          { status: 503 }
        );
      }
      if (isMissingTable(error?.message, "employees")) {
        return NextResponse.json(
          {
            message: `Employees-tabellen mangler. Kør migrationen ${JOBS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke deaktivere medarbejder." }, { status: 500 });
    }

    return NextResponse.json({ item: toItem(data as EmployeeRow) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved deaktivering af medarbejder." }, { status: 500 });
  }
}
