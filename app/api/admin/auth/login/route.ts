import { NextResponse } from "next/server";

import { adminSessionCookieName, createAdminSessionToken } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type Payload = {
  password?: unknown;
  email?: unknown;
};

const safeCompare = (left: string, right: string) => {
  if (left.length !== right.length) {
    return false;
  }
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    const password = typeof payload.password === "string" ? payload.password : "";
    const emailHint = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const expected = process.env.ADMIN_PASSWORD || "";

    if (!expected) {
      return NextResponse.json({ message: "ADMIN_PASSWORD mangler i miljøvariabler." }, { status: 500 });
    }

    if (!password || !safeCompare(password, expected)) {
      return NextResponse.json({ message: "Forkert adgangskode." }, { status: 401 });
    }

    const supabase = createSupabaseServiceClient();
    const ownerEmail = (process.env.ADMIN_OWNER_EMAIL || "owner@bpslib.dk").trim().toLowerCase();
    const ownerName = (process.env.ADMIN_OWNER_NAME || "Owner").trim();

    const { data: existingUsers, error: usersError } = await supabase
      .from("admin_users")
      .select("id, email, name, role, is_active")
      .order("created_at", { ascending: true });

    if (usersError) {
      const message = usersError.message || "";
      if (message.includes("relation") && message.includes("admin_users")) {
        return NextResponse.json(
          {
            message:
              "Tabellen admin_users mangler i databasen. Kør migrationen supabase/migrations/20260210_000018_admin_rbac.sql."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: usersError.message }, { status: 500 });
    }

    let activeUsers = (existingUsers || []).filter((user) => user.is_active !== false);
    if (emailHint) {
      activeUsers = activeUsers.filter((user) => user.email?.toLowerCase() === emailHint);
    }

    const pickByRole = (role: string) => activeUsers.find((user) => user.role === role);
    let selected =
      pickByRole("owner") ||
      pickByRole("admin") ||
      pickByRole("employee") ||
      pickByRole("viewer") ||
      activeUsers[0];

    if (!selected) {
      const { data: created, error: createError } = await supabase
        .from("admin_users")
        .insert({
          email: ownerEmail,
          name: ownerName,
          role: "owner",
          is_active: true
        })
        .select("id, email, name, role, is_active")
        .single();

      if (createError || !created) {
        return NextResponse.json(
          { message: createError?.message || "Kunne ikke oprette admin-bruger." },
          { status: 500 }
        );
      }
      selected = created;
    }

    const token = createAdminSessionToken({
      id: selected.id,
      email: selected.email,
      name: selected.name || "Admin",
      role: selected.role || "owner"
    });
    const response = NextResponse.json({ ok: true });

    response.cookies.set(adminSessionCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved login." }, { status: 500 });
  }
}
