"use client";

import { Button } from "@/components/ui/button";
import { usePageContext } from "@/components/tracking/use-page-context";
import { getAreaBySlug } from "@/lib/areas";
import { useEffect, useRef, useState } from "react";
import { buildTrackingParams, getPersistedUtm, pushEvent } from "@/lib/tracking";
import { buildWhatsAppMessage, getWhatsAppLink } from "@/lib/whatsapp";
import type { LeadFormData } from "@/lib/leads/schema";

export function WhatsAppButton({
  label = "Chat on WhatsApp",
  className
}: {
  label?: string;
  className?: string;
}) {
  const fireRef = useRef(0);
  const pageContext = usePageContext();
  const trackingParams = buildTrackingParams(pageContext, getPersistedUtm());
  const areaName = pageContext.area ? getAreaBySlug(pageContext.area)?.name : undefined;
  const [message, setMessage] = useState(
    buildWhatsAppMessage({ areas: areaName ? [areaName] : undefined })
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw =
      window.sessionStorage.getItem("lead_machine_last_lead") ??
      window.localStorage.getItem("lead_machine_lead_draft");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as LeadFormData;
      setMessage(
        buildWhatsAppMessage({
          areas: parsed.areas?.length
            ? parsed.areas.map((slug) => getAreaBySlug(slug)?.name ?? slug)
            : areaName
            ? [areaName]
            : undefined,
          budgetBand: parsed.budget_band,
          timeline: parsed.timeline,
          purpose: parsed.purpose,
          mustHaves: parsed.must_haves
        })
      );
    } catch {
      setMessage(buildWhatsAppMessage({ areas: areaName ? [areaName] : undefined }));
    }
  }, [areaName]);

  const link = getWhatsAppLink(message);

  const handleClick = () => {
    const now = Date.now();
    if (now - fireRef.current < 500) return;
    fireRef.current = now;
    pushEvent("whatsapp_click", trackingParams);
  };

  return (
    <Button
      asChild
      variant="outline"
      className={className}
      onMouseDown={handleClick}
      onClick={handleClick}
    >
      <a href={link} target="_blank" rel="noreferrer">
        {label}
      </a>
    </Button>
  );
}
