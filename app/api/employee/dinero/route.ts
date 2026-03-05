import { NextResponse } from "next/server";

import { verifyDineroCredentials } from "@/lib/dinero";
import { encryptSecret } from "@/lib/encryption";
import { getSessionEmployee, isMissingTable } from "@/lib/employee-session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const DINERO_MIGRATION = "supabase/migrations/20260305_000100_employee_dinero_invoicing.sql";

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function GET(request: Request) {
  try {
    const { error, employee } = await getSessionEmployee(request);
    if (error || !employee) {
      return error;
    }

    const supabase = createSupabaseServiceClient();
    const { data, error: fetchError } = await supabase
      .from("employee_dinero_connections")
      .select("organization_id, is_active, updated_at, last_verified_at, last_error")
      .eq("employee_id", employee.id)
      .maybeSingle();

    if (fetchError) {
      if (isMissingTable(fetchError.message, "employee_dinero_connections")) {
        return NextResponse.json(
          { message: `Dinero-tabellen mangler. Kør migrationen ${DINERO_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: fetchError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        connected: Boolean(data?.organization_id && data?.is_active),
        organizationId: data?.organization_id || null,
        updatedAt: data?.updated_at || null,
        lastVerifiedAt: data?.last_verified_at || null,
        lastError: data?.last_error || null
      },
      { status: 200 }
    );
  } catch (routeError) {
    console.error(routeError);
    return NextResponse.json({ message: "Uventet fejl ved hentning af Dinero-status." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error, employee, session } = await getSessionEmployee(request);
    if (error || !employee || !session) {
      return error;
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const organizationId = asTrimmed(payload.organizationId);
    const apiKey = asTrimmed(payload.apiKey);

    if (!organizationId) {
      return NextResponse.json({ message: "Dinero organization-id mangler." }, { status: 400 });
    }

    if (apiKey.length < 20) {
      return NextResponse.json({ message: "Dinero API-nøglen ser ugyldig ud." }, { status: 400 });
    }

    await verifyDineroCredentials(organizationId, apiKey);

    const encrypted = encryptSecret(apiKey);

    const supabase = createSupabaseServiceClient();
    const { error: upsertError } = await supabase.from("employee_dinero_connections").upsert(
      {
        employee_id: employee.id,
        connected_by_user_id: session.id,
        organization_id: organizationId,
        api_key_encrypted: encrypted,
        is_active: true,
        last_verified_at: new Date().toISOString(),
        last_error: null
      },
      { onConflict: "employee_id" }
    );

    if (upsertError) {
      if (isMissingTable(upsertError.message, "employee_dinero_connections")) {
        return NextResponse.json(
          { message: `Dinero-tabellen mangler. Kør migrationen ${DINERO_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, connected: true, organizationId }, { status: 200 });
  } catch (routeError) {
    console.error(routeError);
    const message = routeError instanceof Error ? routeError.message : "Uventet fejl ved opsætning af Dinero.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error, employee } = await getSessionEmployee(request);
    if (error || !employee) {
      return error;
    }

    const supabase = createSupabaseServiceClient();
    const { data, error: fetchError } = await supabase
      .from("employee_dinero_connections")
      .select("id")
      .eq("employee_id", employee.id)
      .maybeSingle();

    if (fetchError) {
      if (isMissingTable(fetchError.message, "employee_dinero_connections")) {
        return NextResponse.json(
          { message: `Dinero-tabellen mangler. Kør migrationen ${DINERO_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: fetchError.message }, { status: 500 });
    }

    if (!data?.id) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const { error: updateError } = await supabase
      .from("employee_dinero_connections")
      .update({ is_active: false, last_error: null })
      .eq("id", data.id);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, connected: false }, { status: 200 });
  } catch (routeError) {
    console.error(routeError);
    const message = routeError instanceof Error ? routeError.message : "Uventet fejl ved frakobling af Dinero.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
