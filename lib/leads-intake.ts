import { createSupabaseAnonClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { sendEmail } from "@/lib/notify/email";
import { buildNewLeadTemplate } from "@/lib/notify/templates";

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

  const row = {
    id: leadId,
    source: normalizeSource(input.source),
    service: normalizeService(input.service),
    name: cleanContactField(input.name),
    email: cleanContactField(input.email),
    phone: cleanContactField(input.phone),
    location: cleanContactField(input.location),
    message: cleanContactField(input.message),
    page_url: cleanContactField(input.pageUrl),
    utm: sanitizeObject(input.utm),
    meta: sanitizeObject(input.meta)
  };

  const { error } = await supabase.from("leads").insert(row);

  if (error) {
    return {
      ok: false as const,
      leadId: null,
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
    error: null
  };
};
