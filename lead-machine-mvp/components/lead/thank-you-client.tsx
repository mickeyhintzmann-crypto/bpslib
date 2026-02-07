"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildTrackingParams, getPersistedUtm, pushEvent } from "@/lib/tracking";
import { buildWhatsAppMessage, getWhatsAppLink } from "@/lib/whatsapp";
import { usePageContext } from "@/components/tracking/use-page-context";
import type { LeadFormData } from "@/lib/leads/schema";
import { getAreaBySlug } from "@/lib/areas";

export function ThankYouClient() {
  const fireRef = useRef(0);
  const pageContext = usePageContext();
  const trackingParams = useMemo(
    () => buildTrackingParams(pageContext, getPersistedUtm()),
    [pageContext]
  );
  const [lead, setLead] = useState<LeadFormData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("lead_machine_last_lead");
    const fallback = window.localStorage.getItem("lead_machine_lead_draft");
    const source = raw ?? fallback;
    if (!source) return;
    try {
      const parsed = JSON.parse(source) as LeadFormData;
      setLead(parsed);
    } catch {
      setLead(null);
    }
  }, []);

  const areas = lead?.areas?.length
    ? lead.areas.map((slug) => getAreaBySlug(slug)?.name ?? slug)
    : undefined;

  const message = buildWhatsAppMessage({
    areas,
    budgetBand: lead?.budget_band,
    timeline: lead?.timeline,
    purpose: lead?.purpose,
    mustHaves: lead?.must_haves
  });
  const link = getWhatsAppLink(message);

  const handleClick = () => {
    const now = Date.now();
    if (now - fireRef.current < 500) return;
    fireRef.current = now;
    pushEvent("whatsapp_click", trackingParams);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="font-display text-2xl text-white">Send details now on WhatsApp</h2>
      <p className="mt-3 text-sm text-neutral-300">
        This helps us confirm your criteria and move to scheduling.
      </p>
      <div className="mt-6">
        <Button
          asChild
          className="text-xs uppercase tracking-[0.2em]"
          onMouseDown={handleClick}
          onClick={handleClick}
        >
          <a href={link} target="_blank" rel="noreferrer">
            Chat on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
