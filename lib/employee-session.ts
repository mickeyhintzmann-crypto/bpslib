import { NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const EMPLOYEE_EMAIL_MIGRATION = "supabase/migrations/20260304000070_employee_portal_email.sql";

export type EmployeeSessionRow = {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
};

export const isMissingTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

export const isMissingColumn = (message: string | undefined, table: string, column: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`column ${table}.${column} does not exist`) ||
    normalized.includes(`column \"${column}\" of relation \"${table}\" does not exist`) ||
    normalized.includes(`could not find the '${column}' column of '${table}'`)
  );
};

export const getSessionEmployee = async (request: Request) => {
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

  if (!data || (data as EmployeeSessionRow).is_active === false) {
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
    employee: data as EmployeeSessionRow
  };
};
