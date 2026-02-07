import { NextResponse } from "next/server";

export function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const supabaseOk = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!siteUrl || !adminPassword) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing required env vars for production."
      },
      { status: 500 }
    );
  }

  if (!supabaseOk) {
    return NextResponse.json(
      {
        ok: false,
        message: "Leads disabled until Supabase env is set."
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
