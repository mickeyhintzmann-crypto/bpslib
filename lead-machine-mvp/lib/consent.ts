export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const CONSENT_COOKIE = "lead_machine_consent";
const CONSENT_TTL_DAYS = 180;
const STORAGE_KEY = "lead_machine_consent";

function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentState;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.necessary !== true) return null;
    if (typeof parsed.analytics !== "boolean") return null;
    if (typeof parsed.marketing !== "boolean") return null;
    if (typeof parsed.updatedAt !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!value) return null;
  return decodeURIComponent(value.split("=").slice(1).join("="));
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const maxAge = CONSENT_TTL_DAYS * 24 * 60 * 60;
  const secure = typeof location !== "undefined" && location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function getStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  const local = parseConsent(window.localStorage.getItem(STORAGE_KEY));
  if (local) return local;
  const cookie = parseConsent(readCookie(CONSENT_COOKIE));
  return cookie;
}

export function setStoredConsent(consent: ConsentState) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(consent);
  window.localStorage.setItem(STORAGE_KEY, payload);
  writeCookie(CONSENT_COOKIE, payload);
  window.dispatchEvent(new CustomEvent("consent:updated", { detail: consent }));
}

export function createConsentState({
  analytics,
  marketing
}: {
  analytics: boolean;
  marketing: boolean;
}): ConsentState {
  return {
    necessary: true,
    analytics,
    marketing,
    updatedAt: new Date().toISOString()
  };
}

export function hasTrackingConsent(consent?: ConsentState | null) {
  return Boolean(consent && (consent.analytics || consent.marketing));
}

export function defaultConsentState() {
  return createConsentState({ analytics: false, marketing: false });
}
