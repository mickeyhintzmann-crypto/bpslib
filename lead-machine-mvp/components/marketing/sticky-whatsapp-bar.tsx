"use client";

import { useMemo, useRef } from "react";
import { getAreaBySlug } from "@/lib/areas";
import type { PageContext } from "@/lib/tracking";
import { buildTrackingParams, getPersistedUtm, pushEvent } from "@/lib/tracking";
import { buildWhatsAppMessage, getWhatsAppLink } from "@/lib/whatsapp";

export function StickyWhatsAppBar({ pageContext }: { pageContext: PageContext }) {
  const fireRef = useRef(0);
  const trackingParams = useMemo(
    () => buildTrackingParams(pageContext, getPersistedUtm()),
    [pageContext]
  );

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
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-neutral-950/95 px-4 py-3 backdrop-blur md:hidden">
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between rounded-full bg-white px-4 py-3 text-xs uppercase tracking-[0.2em] text-neutral-900"
        onMouseDown={handleClick}
        onClick={handleClick}
      >
        Chat on WhatsApp
        <span className="text-neutral-500">Fast reply</span>
      </a>
    </div>
  );
}
