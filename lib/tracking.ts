export type TrackingPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const trackEvent = (eventName: string, payload: TrackingPayload = {}) => {
  if (typeof window === "undefined") {
    return;
  }

  const eventData = {
    event: eventName,
    ...payload
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
};
