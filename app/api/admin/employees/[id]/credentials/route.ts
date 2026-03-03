import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { generateActivationCode } from "@/lib/employee-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const EMPLOYEE_PORTAL_MIGRATION = "supabase/migrations/20260304_000080_employee_password_setup.sql";
const EMPLOYEE_EMAIL_MIGRATION = "supabase/migrations/20260304_000070_employee_portal_email.sql";
const ADMIN_RBAC_MIGRATION = "supabase/migrations/20260210_000018_admin_rbac.sql";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type EmployeeRow = {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
};

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const employeeId = await resolveId(context);
    if (!employeeId) {
      return NextResponse.json({ message: "Mangler medarbejder-id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: employeeData, error: employeeError } = await supabase
      .from("employees")
      .select("id, name, email, is_active")
      .eq("id", employeeId)
      .single();

    if (employeeError || !employeeData) {
      if (isMissingColumn(employeeError?.message, "employees", "email")) {
        return NextResponse.json(
          { message: `Employees-email mangler. Kør migrationen ${EMPLOYEE_EMAIL_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: employeeError?.message || "Medarbejder blev ikke fundet." }, { status: 404 });
    }

    const employee = employeeData as EmployeeRow;
    const email = asTrimmed(employee.email).toLowerCase();
    if (!email) {
      return NextResponse.json(
        { message: "Medarbejder mangler email. Udfyld email før login-kode kan oprettes." },
        { status: 400 }
      );
    }
    if (!employee.is_active) {
      return NextResponse.json({ message: "Medarbejderen er inaktiv." }, { status: 400 });
    }

    const { data: existingAdminUser, error: adminFetchError } = await supabase
      .from("admin_users")
      .select("id, email, name, role, is_active")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();

    if (adminFetchError) {
      if (isMissingTable(adminFetchError.message, "admin_users")) {
        return NextResponse.json(
          { message: `Admin-users mangler. Kør migrationen ${ADMIN_RBAC_MIGRATION}.` },
          { status: 503 }
        );
      }
      if (isMissingColumn(adminFetchError.message, "admin_users", "employee_activation_code")) {
        return NextResponse.json(
          { message: `Employee login-felter mangler. Kør migrationen ${EMPLOYEE_PORTAL_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: adminFetchError.message }, { status: 500 });
    }

    let adminUserId = (existingAdminUser as AdminUserRow | null)?.id || null;
    if (!adminUserId) {
      const { data: createdAdminUser, error: createAdminUserError } = await supabase
        .from("admin_users")
        .insert({
          email,
          name: employee.name || "Medarbejder",
          role: "employee",
          is_active: true
        })
        .select("id")
        .single();

      if (createAdminUserError || !createdAdminUser) {
        if (isMissingColumn(createAdminUserError?.message, "admin_users", "employee_activation_code")) {
          return NextResponse.json(
            { message: `Employee login-felter mangler. Kør migrationen ${EMPLOYEE_PORTAL_MIGRATION}.` },
            { status: 503 }
          );
        }
        return NextResponse.json(
          { message: createAdminUserError?.message || "Kunne ikke oprette medarbejderbruger." },
          { status: 500 }
        );
      }

      adminUserId = (createdAdminUser as { id: string }).id;
    }

    const activationCode = generateActivationCode();
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        role: "employee",
        is_active: true,
        employee_activation_code: activationCode,
        employee_password_hash: null,
        employee_password_set_at: null
      })
      .eq("id", adminUserId);

    if (updateError) {
      if (isMissingColumn(updateError.message, "admin_users", "employee_activation_code")) {
        return NextResponse.json(
          { message: `Employee login-felter mangler. Kør migrationen ${EMPLOYEE_PORTAL_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        ok: true,
        activationCode,
        employee: {
          id: employee.id,
          name: employee.name,
          email
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved oprettelse af medarbejder-login." }, { status: 500 });
  }
}
