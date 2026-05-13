import { UTM_STORAGE_KEY, type UtmPayload, sanitizeUtm } from "@/lib/utm";

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const UTM_QUERY_KEYS = {
  utm_source: "source",
  utm_medium: "medium",
  utm_campaign: "campaign",
  utm_term: "term",
  utm_content: "content"
} as const;

const isBrowser = () => typeof window !== "undefined";

export const track = (eventName: string, payload: AnalyticsPayload = {}) => {
  if (!isBrowser()) {
    return;
  }

  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, payload);
};

const readUtmFromSearch = (search: URLSearchParams): UtmPayload | null => {
  const candidate: Partial<UtmPayload> = {};

  for (const [queryKey, field] of Object.entries(UTM_QUERY_KEYS)) {
    const value = search.get(queryKey);
    if (value) {
      candidate[field] = value;
    }
  }

  return sanitizeUtm(candidate);
};

export const getStoredUtm = (): UtmPayload | null => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return sanitizeUtm(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const persistUtmToSession = (utm: UtmPayload | null) => {
  if (!isBrowser()) {
    return;
  }

  if (!utm) {
    return;
  }

  try {
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // Ignore storage issues in privacy mode.
  }
};

export const captureUtmFromCurrentUrl = (): UtmPayload | null => {
  if (!isBrowser()) {
    return null;
  }

  const utm = readUtmFromSearch(new URLSearchParams(window.location.search));
  if (utm) {
    persistUtmToSession(utm);
    return utm;
  }

  return getStoredUtm();
};

