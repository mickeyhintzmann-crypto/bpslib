"use client";

import { useEffect, useMemo, useState } from "react";
import { publicEnv } from "@/lib/env.public";
import { getPersistedUtm, getTrackingEventLog, type TrackingEvent } from "@/lib/tracking";
import { getStoredConsent } from "@/lib/consent";

export function TrackingDebugPanel() {
  const enabled = publicEnv.NEXT_PUBLIC_TRACKING_DEBUG === "1";
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [utm, setUtm] = useState(getPersistedUtm());
  const [consent, setConsent] = useState(getStoredConsent());

  useEffect(() => {
    if (!enabled) return;
    setEvents(getTrackingEventLog());
    setUtm(getPersistedUtm());
    setConsent(getStoredConsent());

    const handleTracking = () => setEvents(getTrackingEventLog());
    const handleConsent = () => setConsent(getStoredConsent());

    window.addEventListener("tracking:event", handleTracking);
    window.addEventListener("consent:updated", handleConsent);

    const interval = window.setInterval(() => {
      setUtm(getPersistedUtm());
    }, 3000);

    return () => {
      window.removeEventListener("tracking:event", handleTracking);
      window.removeEventListener("consent:updated", handleConsent);
      window.clearInterval(interval);
    };
  }, [enabled]);

  const formattedConsent = useMemo(() => {
    if (!consent) return "none";
    return `${consent.analytics ? "analytics" : "no-analytics"}, ${consent.marketing ? "marketing" : "no-marketing"}`;
  }, [consent]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-2xl border border-neutral-200 bg-white/95 p-4 text-xs text-neutral-900 shadow-xl">
      <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Tracking debug</p>
      <div className="mt-2 space-y-1">
        <p className="text-neutral-500">Consent: {formattedConsent}</p>
        <p className="text-neutral-500">UTM: {Object.keys(utm).length ? JSON.stringify(utm) : "none"}</p>
      </div>
      <div className="mt-3 max-h-48 overflow-auto rounded-xl border border-neutral-200 bg-white p-2">
        {events.length === 0 ? (
          <p className="text-neutral-500">No events captured.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((event, index) => (
              <li key={`${event.timestamp}-${index}`}>
                <p className="font-medium">{event.event}</p>
                <p className="text-[11px] text-neutral-500">
                  {JSON.stringify(event.params)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
