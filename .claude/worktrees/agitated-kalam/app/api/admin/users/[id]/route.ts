import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const ROLE_VALUES = ["owner", "admin", "employee", "viewer"] as const;

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export async function GET(request: Request, context: RouteContext) {
  const { error: authError } = requireAdmin(request, ["owner"]);
  if (authError) {
    return authError;
  }

  const params = await Promise.resolve(context.params);
  const supabase = createSupabaseServiceClient();
  const { data, error: fetchError } = await supabase
    .from("admin_users")
    .select("id, created_at, email, name, role, is_active")
    .eq("id", params.id)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ message: fetchError?.message || "Bruger blev ikke fundet." }, { status: 404 });
  }

  return NextResponse.json({ item: data }, { status: 200 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { session, error: authError } = requireAdmin(request, ["owner"]);
  if (authError) {
    return authError;
  }

  const params = await Promise.resolve(context.params);
  const payload = (await request.json()) as Record<string, unknown>;
  const update: Record<string, unknown> = {};

  if ("email" in payload) {
    const email = asTrimmed(payload.email).toLowerCase();
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ message: "Indtast en gyldig email." }, { status: 400 });
    }
    update.email = email;
  }

  if ("name" in payload) {
    const name = asTrimmed(payload.name);
    if (name && name.length < 2) {
      return NextResponse.json({ message: "Navn skal være mindst 2 tegn." }, { status: 400 });
    }
    update.name = name;
  }

  if ("role" in payload) {
    const role = asTrimmed(payload.role);
    if (role && !ROLE_VALUES.includes(role as (typeof ROLE_VALUES)[number])) {
      return NextResponse.json({ message: "Ugyldig rolle." }, { status: 400 });
    }
    update.role = role;
  }

  if ("is_active" in payload) {
    update.is_active = payload.is_active === false ? false : true;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ message: "Ingen ændringer at gemme." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error: updateError } = await supabase
    .from("admin_users")
    .update(update)
    .eq("id", params.id)
    .select("id, created_at, email, name, role, is_active")
    .single();

  if (updateError || !data) {
    return NextResponse.json({ message: updateError?.message || "Kunne ikke opdatere bruger." }, { status: 500 });
  }

  await auditLog({
    action: "user.update",
    entityType: "user",
    entityId: params.id,
    meta: { after: data },
    req: request,
    actor: session?.email,
    role: session?.role
  });

  return NextResponse.json({ item: data }, { status: 200 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { session, error: authError } = requireAdmin(request, ["owner"]);
  if (authError) {
    return authError;
  }

  const params = await Promise.resolve(context.params);
  const supabase = createSupabaseServiceClient();
  const { data, error: deleteError } = await supabase
    .from("admin_users")
    .update({ is_active: false })
    .eq("id", params.id)
    .select("id, created_at, email, name, role, is_active")
    .single();

  if (deleteError || !data) {
    return NextResponse.json({ message: deleteError?.message || "Kunne ikke deaktivere bruger." }, { status: 500 });
  }

  await auditLog({
    action: "user.deactivate",
    entityType: "user",
    entityId: params.id,
    meta: { after: data },
    req: request,
    actor: session?.email,
    role: session?.role
  });

  return NextResponse.json({ item: data }, { status: 200 });
}
