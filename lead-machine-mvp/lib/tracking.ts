import { getStoredConsent, hasTrackingConsent } from "@/lib/consent";

export type UTMParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  wbraid?: string;
  gbraid?: string;
  fbclid?: string;
  msclkid?: string;
  referrer?: string;
  landing_path?: string;
};

export type PageContext = {
  page_type: "home" | "hub" | "area" | "intent" | "guide" | "contact";
  area?: string;
  intent?: string;
};

export type TrackingEvent = {
  event: string;
  params: Record<string, string | number | undefined>;
  timestamp: number;
};

const STORAGE_KEY = "lead_machine_utm";
const EVENT_LOG_KEY = "__leadMachineTrackingEvents";
const TTL_MS = 1000 * 60 * 60 * 24 * 30;

function getNow() {
  return Date.now();
}

function readStorage(): { data: UTMParams; expiresAt: number } | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { data: UTMParams; expiresAt: number };
    if (!parsed.expiresAt || parsed.expiresAt < getNow()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeStorage(data: UTMParams) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({ data, expiresAt: getNow() + TTL_MS });
  window.localStorage.setItem(STORAGE_KEY, payload);
}

export function getPersistedUtm(): UTMParams {
  const stored = readStorage();
  return stored?.data ?? {};
}

export function persistUtmFromUrl(searchParams?: URLSearchParams) {
  if (typeof window === "undefined") return;
  const params = searchParams ?? new URLSearchParams(window.location.search);

  const stored = readStorage();
  const data: UTMParams = { ...(stored?.data ?? {}) };
  let changed = false;

  const updates: Array<keyof UTMParams> = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "wbraid",
    "gbraid",
    "fbclid",
    "msclkid"
  ];

  updates.forEach((key) => {
    const value = params.get(key) ?? undefined;
    if (value) {
      if (data[key] !== value) {
        data[key] = value;
        changed = true;
      }
    }
  });

  if (!data.landing_path) {
    data.landing_path = `${window.location.pathname}${window.location.search}`;
    changed = true;
  }

  if (!data.referrer && document.referrer) {
    data.referrer = document.referrer;
    changed = true;
  }

  if (changed) {
    writeStorage(data);
  }
}

export function pushEvent(
  event: string,
  params: Record<string, string | number | undefined> = {}
) {
  if (typeof window === "undefined") return;
  const consent = getStoredConsent();
  if (!hasTrackingConsent(consent)) {
    return;
  }

  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (!dataLayer) {
    (window as Window & { dataLayer?: unknown[] }).dataLayer = [];
  }

  const payload = {
    event,
    ...params
  };

  (window as Window & { dataLayer?: unknown[] }).dataLayer?.push(payload);
  recordTrackingEvent({ event, params, timestamp: Date.now() });
  window.dispatchEvent(new CustomEvent("tracking:event", { detail: payload }));
}

export function buildTrackingParams(context: PageContext, utm?: UTMParams) {
  return {
    page_type: context.page_type,
    area: context.area ?? "none",
    intent: context.intent ?? "none",
    ...utm
  };
}

export function getTrackingEventLog(): TrackingEvent[] {
  if (typeof window === "undefined") return [];
  const events = (window as unknown as { [key: string]: TrackingEvent[] })[
    EVENT_LOG_KEY
  ];
  return events ?? [];
}

function recordTrackingEvent(event: TrackingEvent) {
  if (typeof window === "undefined") return;
  const win = window as unknown as { [key: string]: TrackingEvent[] };
  const existing = win[EVENT_LOG_KEY] ?? [];
  const updated = [event, ...existing].slice(0, 20);
  win[EVENT_LOG_KEY] = updated;
}
