import { NextResponse } from "next/server";

export function GET() {
  const env = {
    gtm: Boolean(process.env.NEXT_PUBLIC_GTM_ID),
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    email: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
    redis: Boolean(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    )
  };

  return NextResponse.json({ ok: true, env });
}
