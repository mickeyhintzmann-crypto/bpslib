"use client";

import { Button } from "@/components/ui/button";
import { usePageContext } from "@/components/tracking/use-page-context";
import { getAreaBySlug } from "@/lib/areas";
import { useRef } from "react";
import { buildTrackingParams, getPersistedUtm, pushEvent } from "@/lib/tracking";
import { buildWhatsAppMessage, getWhatsAppLink } from "@/lib/whatsapp";

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
  const message = buildWhatsAppMessage({ areas: areaName ? [areaName] : undefined });
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
