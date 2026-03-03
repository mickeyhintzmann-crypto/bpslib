import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/employee-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const EMPLOYEE_PORTAL_MIGRATION = "supabase/migrations/20260304_000080_employee_password_setup.sql";
const ADMIN_RBAC_MIGRATION = "supabase/migrations/20260210_000018_admin_rbac.sql";

type Payload = {
  email?: unknown;
  activationCode?: unknown;
  password?: unknown;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

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

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    const email = asTrimmed(payload.email).toLowerCase();
    const activationCode = asTrimmed(payload.activationCode).toUpperCase();
    const password = asTrimmed(payload.password);

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Indtast en gyldig email." }, { status: 400 });
    }
    if (activationCode.length < 4) {
      return NextResponse.json({ message: "Indtast aktiveringskoden." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: "Kodeord skal være mindst 8 tegn." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, role, is_active, employee_activation_code")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingTable(error.message, "admin_users")) {
        return NextResponse.json(
          { message: `Admin-users mangler. Kør migrationen ${ADMIN_RBAC_MIGRATION}.` },
          { status: 503 }
        );
      }
      if (isMissingColumn(error.message, "admin_users", "employee_activation_code")) {
        return NextResponse.json(
          { message: `Employee login-felter mangler. Kør migrationen ${EMPLOYEE_PORTAL_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ message: "Ingen medarbejderbruger fundet med denne email." }, { status: 404 });
    }

    const row = data as {
      id: string;
      role: string;
      is_active: boolean;
      employee_activation_code: string | null;
    };

    if (row.role !== "employee") {
      return NextResponse.json({ message: "Brugeren er ikke en medarbejder." }, { status: 403 });
    }
    if (!row.is_active) {
      return NextResponse.json({ message: "Brugeren er inaktiv." }, { status: 403 });
    }
    if (!row.employee_activation_code || row.employee_activation_code !== activationCode) {
      return NextResponse.json({ message: "Forkert aktiveringskode." }, { status: 401 });
    }

    const passwordHash = hashPassword(password);
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        employee_password_hash: passwordHash,
        employee_password_set_at: new Date().toISOString(),
        employee_activation_code: null
      })
      .eq("id", row.id);

    if (updateError) {
      if (isMissingColumn(updateError.message, "admin_users", "employee_password_hash")) {
        return NextResponse.json(
          { message: `Employee login-felter mangler. Kør migrationen ${EMPLOYEE_PORTAL_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opsætning af kodeord." }, { status: 500 });
  }
}
