import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const JOBS_SCHEMA_MIGRATION = "supabase/migrations/20260302_000040_admin_jobs_calendar_schema.sql";

type EmployeeRow = {
  id: string;
  created_at: string;
  name: string;
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

const toItem = (row: EmployeeRow) => ({
  id: row.id,
  createdAt: row.created_at,
  name: row.name,
  role: row.role,
  isActive: row.is_active,
  calendarColor: row.calendar_color
});

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const includeAll = url.searchParams.get("all") === "1";

    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("employees")
      .select("id, created_at, name, role, is_active, calendar_color")
      .order("is_active", { ascending: false })
      .order("name", { ascending: true });

    if (!includeAll) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      if (isMissingTable(error.message, "employees")) {
        return NextResponse.json(
          {
            message: `Employees-tabellen mangler. Kør migrationen ${JOBS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        items: ((data || []) as EmployeeRow[]).map(toItem)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af medarbejdere." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const name = asTrimmed(payload.name);
    const role = asTrimmed(payload.role) || "worker";
    const calendarColor = asOptionalString(payload.calendar_color);
    const isActive = payload.is_active !== false;

    if (name.length < 2) {
      return NextResponse.json({ message: "Navn er påkrævet." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("employees")
      .insert({
        name,
        role,
        calendar_color: calendarColor,
        is_active: isActive
      })
      .select("id, created_at, name, role, is_active, calendar_color")
      .single();

    if (error || !data) {
      if (isMissingTable(error?.message, "employees")) {
        return NextResponse.json(
          {
            message: `Employees-tabellen mangler. Kør migrationen ${JOBS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke oprette medarbejder." }, { status: 500 });
    }

    return NextResponse.json({ item: toItem(data as EmployeeRow) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved oprettelse af medarbejder." }, { status: 500 });
  }
}
