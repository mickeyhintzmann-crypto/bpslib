"use client";

import { useRef } from "react";
import { usePageContext } from "@/components/tracking/use-page-context";
import { buildTrackingParams, getPersistedUtm, pushEvent } from "@/lib/tracking";
import { siteConfig } from "@/lib/site";

export function ContactLinks() {
  const emailRef = useRef(0);
  const phoneRef = useRef(0);
  const pageContext = usePageContext();
  const trackingParams = buildTrackingParams(pageContext, getPersistedUtm());

  const handleEmail = () => {
    const now = Date.now();
    if (now - emailRef.current < 500) return;
    emailRef.current = now;
    pushEvent("email_click", trackingParams);
  };

  const handlePhone = () => {
    const now = Date.now();
    if (now - phoneRef.current < 500) return;
    phoneRef.current = now;
    pushEvent("phone_click", trackingParams);
  };

  return (
    <div className="flex flex-col gap-2 text-sm text-neutral-300">
      <a
        href={`mailto:${siteConfig.contact.email}`}
        onMouseDown={handleEmail}
        onClick={handleEmail}
        className="hover:text-white"
      >
        {siteConfig.contact.email}
      </a>
      <a
        href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
        onMouseDown={handlePhone}
        onClick={handlePhone}
        className="hover:text-white"
      >
        {siteConfig.contact.phone}
      </a>
    </div>
  );
}
