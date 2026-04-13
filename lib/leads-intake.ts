import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { sendEmail } from "@/lib/notify/email";
import { buildNewLeadTemplate } from "@/lib/notify/templates";
import { findOrCreateCustomer } from "@/lib/customer-match";

const SOURCE_VALUES = ["form", "ai_quote", "booking", "manual", "import"] as const;
const SERVICE_VALUES = [
  "bordplade",
  "gulvafslibning",
  "gulvbelaegning",
  "microcement",
  "maler",
  "toemrer",
  "murer",
  "andet"
] as const;

type LeadSource = (typeof SOURCE_VALUES)[number];
type LeadService = (typeof SERVICE_VALUES)[number];
type LeadPriority = "urgent" | "high" | "normal" | "low";

export type LeadIntakeInput = {
  source?: string | null;
  service?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  message?: string | null;
  pageUrl?: string | null;
  utm?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
};

type LeadIntakeOptions = {
  useAnonClient?: boolean;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const sanitizeObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const normalizeSource = (value: string | null | undefined): LeadSource => {
  const normalized = asTrimmed(value).toLowerCase();
  if (SOURCE_VALUES.includes(normalized as LeadSource)) {
    return normalized as LeadSource;
  }
  return "form";
};

const normalizeService = (value: string | null | undefined): LeadService | null => {
  const normalized = asTrimmed(value).toLowerCase();
  if (!normalized) {
    return null;
  }
  if (SERVICE_VALUES.includes(normalized as LeadService)) {
    return normalized as LeadService;
  }
  return "andet";
};

const cleanContactField = (value: string | null | undefined) => {
  const trimmed = asTrimmed(value);
  return trimmed || null;
};

const getRequestIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return null;
};

/**
 * Bestem prioritet baseret på kilde og metadata.
 * - booking med source "acute" → urgent
 * - ai_quote (prisberegner med billeder) → high
 * - booking (normal) → high
 * - form / manual / import → normal
 */
const resolvePriority = (source: LeadSource, meta: Record<string, unknown>): LeadPriority => {
  // Akutbooking
  if (source === "booking" && meta.endpoint === "/api/bookings/acute/submit") {
    return "urgent";
  }

  // Prisberegner-forespørgsel (AI quote)
  if (source === "ai_quote") {
    return "high";
  }

  // Normal booking
  if (source === "booking") {
    return "high";
  }

  return "normal";
};

/**
 * Beregn opfølgningsdato baseret på prioritet.
 * - urgent: +2 timer
 * - high: +4 timer
 * - normal: +24 timer
 * - low: +72 timer
 */
const resolveFollowUpAt = (priority: LeadPriority): string => {
  const now = new Date();
  const hoursMap: Record<LeadPriority, number> = {
    urgent: 2,
    high: 4,
    normal: 24,
    low: 72
  };
  now.setHours(now.getHours() + hoursMap[priority]);
  return now.toISOString();
};

export const buildLeadMetaFromRequest = (request: Request) => {
  const referer = request.headers.get("referer") || null;
  return {
    ip: getRequestIp(request),
    userAgent: request.headers.get("user-agent") || null,
    referrer: referer
  } as Record<string, unknown>;
};

export const insertLeadIntake = async (input: LeadIntakeInput, options: LeadIntakeOptions = {}) => {
  const supabase = options.useAnonClient ? createSupabaseAnonClient() : createSupabaseServiceClient();
  const leadId = randomUUID();

  const source = normalizeSource(input.source);
  const meta = sanitizeObject(input.meta);
  const priority = resolvePriority(source, meta);
  const followUpAt = resolveFollowUpAt(priority);

  // ─── Auto-match eller opret kunde ───
  let customerId: string | null = null;
  try {
    const customerResult = await findOrCreateCustomer(supabase, {
      name: input.name || null,
      email: input.email || null,
      phone: input.phone || null,
      postalCode: input.location || null
    });

    if (customerResult.customerId) {
      customerId = customerResult.customerId;
    } else if (customerResult.error) {
      console.error("[lead_intake] customer match failed:", customerResult.error);
    }
  } catch (customerError) {
    // Lad ikke customer-match fejl blokere lead-oprettelse
    console.error("[lead_intake] customer match error:", customerError);
  }

  const row = {
    id: leadId,
    source,
    service: normalizeService(input.service),
    name: cleanContactField(input.name),
    email: cleanContactField(input.email),
    phone: cleanContactField(input.phone),
    location: cleanContactField(input.location),
    message: cleanContactField(input.message),
    page_url: cleanContactField(input.pageUrl),
    utm: sanitizeObject(input.utm),
    meta,
    priority,
    follow_up_at: followUpAt,
    customer_id: customerId
  };

  const { error } = await supabase.from("leads").insert(row);

  if (error) {
    // Fallback: prøv uden de nye kolonner (hvis migration ikke er kørt endnu)
    if (error.message?.includes("column") && error.message?.includes("does not exist")) {
      const { id, source, service, name, email, phone, location, message, page_url, utm, meta: rowMeta } = row;
      const fallbackResult = await supabase.from("leads").insert({
        id, source, service, name, email, phone, location, message, page_url, utm, meta: rowMeta
      });

      if (fallbackResult.error) {
        return {
          ok: false as const,
          leadId: null,
          customerId: null,
          error: fallbackResult.error?.message || "Kunne ikke indsætte lead."
        };
      }

      // Leads oprettet uden customer_id – log det
      console.warn("[lead_intake] inserted without customer_id/priority (migration pending)");
      return { ok: true as const, leadId, customerId, error: null };
    }

    return {
      ok: false as const,
      leadId: null,
      customerId: null,
      error: error?.message || "Kunne ikke indsætte lead."
    };
  }

  if ((process.env.NOTIFY_LEADS_ENABLED || "").toLowerCase() === "true") {
    try {
      const template = buildNewLeadTemplate({
        leadId,
        name: row.name,
        email: row.email,
        phone: row.phone,
        location: row.location,
        service: row.service,
        source: row.source,
        pageUrl: row.page_url,
        message: row.message
      });

      const result = await sendEmail({
        subject: template.subject,
        html: template.html,
        text: template.text,
        enabled: true
      });

      if (!result.ok) {
        console.error("[lead_notify] email failed", result.error);
      }
    } catch (notifyError) {
      console.error("[lead_notify] email failed", notifyError);
    }
  }

  return {
    ok: true as const,
    leadId,
    customerId,
    error: null
  };
};
