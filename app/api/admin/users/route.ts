import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const ROLE_VALUES = ["owner", "admin", "employee", "viewer"] as const;

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export async function GET(request: Request) {
  const { error: authError } = requireAdmin(request, ["owner", "admin"]);
  if (authError) {
    return authError;
  }

  const url = new URL(request.url);
  const role = asTrimmed(url.searchParams.get("role"));
  const activeParam = url.searchParams.get("active");

  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("admin_users")
    .select("id, created_at, email, name, role, is_active")
    .order("created_at", { ascending: true });

  if (role && ROLE_VALUES.includes(role as (typeof ROLE_VALUES)[number])) {
    query = query.eq("role", role);
  }

  if (activeParam === "1") {
    query = query.eq("is_active", true);
  } else if (activeParam === "0") {
    query = query.eq("is_active", false);
  }

  const { data, error: fetchError } = await query;
  if (fetchError) {
    return NextResponse.json({ message: fetchError.message }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] }, { status: 200 });
}

export async function POST(request: Request) {
  const { session, error: authError } = requireAdmin(request, ["owner"]);
  if (authError) {
    return authError;
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const email = asTrimmed(payload.email).toLowerCase();
  const name = asTrimmed(payload.name);
  const role = asTrimmed(payload.role) || "employee";
  const isActive = payload.is_active === false ? false : true;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ message: "Indtast en gyldig email." }, { status: 400 });
  }
  if (!name || name.length < 2) {
    return NextResponse.json({ message: "Indtast et navn." }, { status: 400 });
  }
  if (!ROLE_VALUES.includes(role as (typeof ROLE_VALUES)[number])) {
    return NextResponse.json({ message: "Ugyldig rolle." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error: insertError } = await supabase
    .from("admin_users")
    .insert({
      email,
      name,
      role,
      is_active: isActive
    })
    .select("id, created_at, email, name, role, is_active")
    .single();

  if (insertError || !data) {
    return NextResponse.json({ message: insertError?.message || "Kunne ikke oprette bruger." }, { status: 500 });
  }

  await auditLog({
    action: "user.create",
    entityType: "user",
    entityId: data.id,
    meta: { after: data },
    req: request,
    actor: session?.email,
    role: session?.role
  });

  return NextResponse.json({ item: data }, { status: 200 });
}
