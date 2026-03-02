"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CONTACT_SMS_HREF, CONTACT_TEL_HREF } from "@/lib/contact";
import { getRouteByPath } from "@/lib/site-registry";
import { trackEvent } from "@/lib/tracking";

const tilbudRoute = getRouteByPath("/tilbudstid");
const bookingRoute = getRouteByPath("/bordpladeslibning/book");
const kontaktRoute = getRouteByPath("/kontakt");

const ctaHref = tilbudRoute?.path || bookingRoute?.path || kontaktRoute?.path || "/";
const ctaLabel = tilbudRoute ? "Få tilbud" : "Book";

export const StickyContactBar = () => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/75 bg-background/92 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3.5 shadow-[0_-10px_28px_hsl(20_30%_20%/0.14)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex w-full max-w-[1180px] items-center gap-2 px-4">
        <Button asChild variant="secondary" className="flex-1">
          <a href={CONTACT_TEL_HREF} onClick={() => trackEvent("call_click", { source: "sticky_contact_bar" })}>
            Ring
          </a>
        </Button>

        <Button asChild variant="outline" className="flex-1">
          <a href={CONTACT_SMS_HREF} onClick={() => trackEvent("sms_click", { source: "sticky_contact_bar" })}>
            SMS
          </a>
        </Button>

        <Button asChild className="flex-1">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  );
};
