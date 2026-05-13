import { NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { toIsoDateRange } from "@/lib/admin/jobs";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const EMPLOYEE_EMAIL_MIGRATION = "supabase/migrations/20260304000070_employee_portal_email.sql";
const EMPLOYEE_UNAVAILABILITY_MIGRATION = "supabase/migrations/20260304000090_employee_unavailability.sql";

type EmployeeRow = {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
};

type UnavailabilityType = "sick" | "vacation" | "personal";

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

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

const isMissingColumn = (message: string | undefined, table: string, column: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`column ${table}.${column} does not exist`) ||
    normalized.includes(`column \"${column}\" of relation \"${table}\" does not exist`) ||
    normalized.includes(`could not find the '${column}' column of '${table}'`)
  );
};

const normalizeType = (value: string): UnavailabilityType | null => {
  if (value === "sick") {
    return "sick";
  }
  if (value === "vacation") {
    return "vacation";
  }
  if (value === "personal") {
    return "personal";
  }
  return null;
};

const getSessionEmployee = async (request: Request) => {
  const session = getAdminSessionFromRequest(request);
  if (!session || session.role !== "employee") {
    return {
      error: NextResponse.json({ message: "Ingen adgang." }, { status: 401 }),
      session: null,
      employee: null
    };
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
          { message: `Employees-email mangler. Kør migrationen ${EMPLOYEE_EMAIL_MIGRATION}.` },
          { status: 503 }
        ),
        session: null,
        employee: null
      };
    }
    if (isMissingTable(error.message, "employees")) {
      return {
        error: NextResponse.json(
          { message: "Employees-tabellen mangler. Kør jobs-migrationen i Supabase." },
          { status: 503 }
        ),
        session: null,
        employee: null
      };
    }
    return {
      error: NextResponse.json({ message: error.message }, { status: 500 }),
      session: null,
      employee: null
    };
  }

  if (!data || (data as EmployeeRow).is_active === false) {
    return {
      error: NextResponse.json(
        { message: "Din medarbejderprofil mangler eller er inaktiv. Kontakt administrator." },
        { status: 403 }
      ),
      session: null,
      employee: null
    };
  }

  return {
    error: null,
    session,
    employee: data as EmployeeRow
  };
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
      .from("employee_unavailability")
      .select("id, type, note, start_at, end_at, created_at")
      .eq("employee_id", employee.id)
      .lte("start_at", toIso)
      .gte("end_at", fromIso)
      .order("start_at", { ascending: true });

    if (error) {
      if (isMissingTable(error.message, "employee_unavailability")) {
        return NextResponse.json(
          {
            message: `Fraværstabellen mangler. Kør migrationen ${EMPLOYEE_UNAVAILABILITY_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const items = (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      note: row.note,
      startAt: row.start_at,
      endAt: row.end_at,
      createdAt: row.created_at
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af fravær." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error: sessionError, employee, session } = await getSessionEmployee(request);
    if (sessionError || !employee || !session) {
      return sessionError;
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const type = normalizeType(asTrimmed(payload.type).toLowerCase());
    const note = asTrimmed(payload.note);
    const startAt = parseIsoDate(asTrimmed(payload.startAt));
    const endAt = parseIsoDate(asTrimmed(payload.endAt));

    if (!type) {
      return NextResponse.json({ message: "Ugyldig type. Brug sick, vacation eller personal." }, { status: 400 });
    }
    if (!startAt || !endAt) {
      return NextResponse.json({ message: "startAt og endAt skal være gyldige dato/tider." }, { status: 400 });
    }

    const startMs = new Date(startAt).getTime();
    const endMs = new Date(endAt).getTime();
    if (endMs <= startMs) {
      return NextResponse.json({ message: "Sluttid skal være efter starttid." }, { status: 400 });
    }

    const maxDurationMs = 1000 * 60 * 60 * 24 * 31;
    if (endMs - startMs > maxDurationMs) {
      return NextResponse.json({ message: "Fravær må maks vare 31 dage ad gangen." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("employee_unavailability")
      .insert({
        employee_id: employee.id,
        created_by_user_id: session.id,
        type,
        note: note || null,
        start_at: startAt,
        end_at: endAt
      })
      .select("id, type, note, start_at, end_at, created_at")
      .single();

    if (error || !data) {
      if (isMissingTable(error?.message, "employee_unavailability")) {
        return NextResponse.json(
          {
            message: `Fraværstabellen mangler. Kør migrationen ${EMPLOYEE_UNAVAILABILITY_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke oprette fravær." }, { status: 500 });
    }

    return NextResponse.json(
      {
        item: {
          id: data.id,
          type: data.type,
          note: data.note,
          startAt: data.start_at,
          endAt: data.end_at,
          createdAt: data.created_at
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved oprettelse af fravær." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error: sessionError, employee } = await getSessionEmployee(request);
    if (sessionError || !employee) {
      return sessionError;
    }

    const url = new URL(request.url);
    const id = asTrimmed(url.searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ message: "Mangler id på fraværspost." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("employee_unavailability")
      .delete()
      .eq("id", id)
      .eq("employee_id", employee.id)
      .select("id")
      .maybeSingle();

    if (error) {
      if (isMissingTable(error.message, "employee_unavailability")) {
        return NextResponse.json(
          {
            message: `Fraværstabellen mangler. Kør migrationen ${EMPLOYEE_UNAVAILABILITY_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ message: "Fraværspost ikke fundet." }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved sletning af fravær." }, { status: 500 });
  }
}
