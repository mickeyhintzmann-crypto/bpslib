export type TrackingPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

const getConsent = () => {
  if (typeof document === "undefined") {
    return "";
  }
  const match = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("cookie_consent="));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

export const trackEvent = (eventName: string, payload: TrackingPayload = {}) => {
  if (typeof window === "undefined") {
    return;
  }

  const gaId = process.env.NEXT_PUBLIC_GA4_ID;
  if (!gaId) {
    return;
  }

  const consent = getConsent();
  if (consent !== "accepted") {
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
    return;
  }

  const eventData = {
    event: eventName,
    ...payload
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
};
