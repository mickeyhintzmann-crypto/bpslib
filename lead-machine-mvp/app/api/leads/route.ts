import { NextResponse } from "next/server";
import { requireSupabaseEnv } from "@/lib/env.supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LeadSchema, type LeadFormData } from "@/lib/leads/schema";
import { calculateLeadScore } from "@/lib/leads/score";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestIp, getUserAgent } from "@/lib/request";
import { logEvent, maskEmail, maskPhone } from "@/lib/logger";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail, sendLeadWebhook, sendSlackMessage } from "@/lib/ops/notifications";

function supabaseConfigErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Missing Supabase configuration.";
  return NextResponse.json({ error: message }, { status: 503 });
}

function normalizeLead(data: LeadFormData) {
  return {
    ...data,
    email: data.email.trim().toLowerCase(),
    phone: data.phone.replace(/\s+/g, ""),
    notes: data.notes ? data.notes.slice(0, 2000) : undefined,
    company: data.company?.trim() ?? "",
    turnstile_token: data.turnstile_token?.trim() ?? ""
  };
}

function formatUtmSummary(utm?: LeadFormData["utm"]) {
  if (!utm) return "none";
  const parts = [
    utm.utm_source && `source=${utm.utm_source}`,
    utm.utm_medium && `medium=${utm.utm_medium}`,
    utm.utm_campaign && `campaign=${utm.utm_campaign}`,
    utm.utm_content && `content=${utm.utm_content}`,
    utm.utm_term && `term=${utm.utm_term}`,
    utm.gclid && "gclid",
    utm.fbclid && "fbclid"
  ].filter(Boolean);
  return parts.length ? parts.join(" | ") : "none";
}

export async function POST(request: Request) {
  try {
    requireSupabaseEnv();
  } catch (error) {
    return supabaseConfigErrorResponse(error);
  }

  const requestIp = getRequestIp(request.headers);
  const userAgent = getUserAgent(request.headers);

  const rate = await rateLimit(`lead:${requestIp}`);
  if (!rate.ok) {
    logEvent("lead_rejected", {
      reason: "rate_limit",
      ip: requestIp,
      remaining: rate.remaining
    }, "warn");

    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": rate.resetSeconds.toString()
        }
      }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = LeadSchema.safeParse(body);

  if (!parsed.success) {
    logEvent("lead_rejected", { reason: "validation", ip: requestIp }, "warn");
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 }
    );
  }

  const normalized = normalizeLead(parsed.data);

  if (normalized.company) {
    logEvent("lead_rejected", { reason: "honeypot", ip: requestIp }, "warn");
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const turnstile = await verifyTurnstile({
    token: normalized.turnstile_token,
    ip: requestIp
  });

  if (!turnstile.ok) {
    logEvent("lead_rejected", { reason: "turnstile", ip: requestIp }, "warn");
    return NextResponse.json({ error: "Verification failed." }, { status: 400 });
  }

  const leadScore = calculateLeadScore(normalized);
  const supabase = createServerSupabaseClient();
  const idempotencyKey = request.headers.get("idempotency-key") ?? undefined;

  const idempotencyCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from("leads")
      .select("id, lead_score")
      .eq("idempotency_key", idempotencyKey)
      .gte("created_at", idempotencyCutoff)
      .maybeSingle();

    if (existing?.id) {
      logEvent("lead_duplicate_idempotency", {
        leadId: existing.id,
        ip: requestIp
      });
      return NextResponse.json({
        ok: true,
        leadId: existing.id,
        leadScore: existing.lead_score ?? leadScore
      });
    }
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: normalized.name,
      email: normalized.email,
      phone: normalized.phone,
      preferred_contact: normalized.preferred_contact,
      areas: normalized.areas,
      budget_band: normalized.budget_band,
      budget_min: normalized.budget_min,
      budget_max: normalized.budget_max,
      timeline: normalized.timeline,
      financing: normalized.financing,
      purpose: normalized.purpose,
      must_haves: normalized.must_haves ?? [],
      notes: normalized.notes,
      lead_score: leadScore,
      idempotency_key: idempotencyKey,
      request_ip: requestIp,
      user_agent: userAgent,
      page_type: normalized.page.page_type,
      area: normalized.page.area,
      intent: normalized.page.intent,
      utm: normalized.utm ?? {},
      consent_state: normalized.consent ?? null
    })
    .select("id, lead_score")
    .single();

  if (error) {
    if (idempotencyKey && error.code === "23505") {
      const { data: existing } = await supabase
        .from("leads")
        .select("id, lead_score")
        .eq("idempotency_key", idempotencyKey)
        .gte("created_at", idempotencyCutoff)
        .maybeSingle();
      if (existing?.id) {
        logEvent("lead_duplicate_idempotency", {
          leadId: existing.id,
          ip: requestIp
        });
        return NextResponse.json({
          ok: true,
          leadId: existing.id,
          leadScore: existing.lead_score ?? leadScore
        });
      }
    }

    logEvent("lead_rejected", { reason: "db_error", ip: requestIp }, "error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logEvent("lead_created", {
    leadId: data?.id,
    leadScore,
    email: maskEmail(normalized.email),
    phone: maskPhone(normalized.phone),
    ip: requestIp
  });

  await sendEmail({
    to: normalized.email,
    subject: "We received your criteria — shortlist within 24h",
    html: `<p>Hi ${normalized.name},</p>
      <p>We’ve received your criteria and will send your curated shortlist within 24 hours.</p>
      <p>If you prefer, you can reply on WhatsApp to confirm any details.</p>
      <p>Buyer Concierge Costa del Sol</p>`
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const adminLink = data?.id ? `${baseUrl}/admin/leads/${data.id}` : "";
  const utmSummary = formatUtmSummary(normalized.utm);

  if (leadScore >= 60) {
    await sendSlackMessage(
      `New high-intent lead (score ${leadScore}). Areas: ${normalized.areas.join(", ")}. ` +
        `Intent: ${normalized.page.intent ?? "none"}. Budget: ${normalized.budget_band}. ` +
        `Timeline: ${normalized.timeline}. Purpose: ${normalized.purpose}. ` +
        `UTM: ${utmSummary}. ${adminLink ? `Admin: ${adminLink}` : ""}`
    );
  }

  await sendLeadWebhook({
    leadId: data?.id,
    leadScore,
    areas: normalized.areas,
    budget_band: normalized.budget_band,
    timeline: normalized.timeline,
    purpose: normalized.purpose,
    page: normalized.page,
    utm: normalized.utm ?? {},
    created_at: new Date().toISOString()
  });

  return NextResponse.json({ ok: true, leadId: data?.id, leadScore });
}
