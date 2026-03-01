"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getRouteByPath } from "@/lib/site-registry";
import { siteConfig } from "@/lib/site-config";
import { trackEvent } from "@/lib/tracking";

const tilbudRoute = getRouteByPath("/tilbudstid");
const bookingRoute = getRouteByPath("/bordpladeslibning/book");
const kontaktRoute = getRouteByPath("/kontakt");

const ctaHref = tilbudRoute?.path || bookingRoute?.path || kontaktRoute?.path || "/";
const ctaLabel = tilbudRoute ? "Få tilbud" : "Book";

const resolveWhatsAppLink = () => {
  const config = siteConfig as {
    whatsappUrl?: string;
    whatsapp?: string;
    whatsApp?: string;
  };

  const raw = config.whatsappUrl || config.whatsapp || config.whatsApp || "";
  if (!raw) {
    return "";
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  return `https://wa.me/${raw.replace(/\D/g, "")}`;
};

const whatsappHref = resolveWhatsAppLink();

export const StickyContactBar = () => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4">
        <Button asChild variant="secondary" className="flex-1">
          <a
            href={`tel:${siteConfig.phone}`}
            onClick={() => trackEvent("call_click", { source: "sticky_contact_bar" })}
          >
            Ring
          </a>
        </Button>

        {whatsappHref ? (
          <Button asChild variant="outline" className="flex-1">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("whatsapp_click", { source: "sticky_contact_bar" })}
            >
              WhatsApp
            </a>
          </Button>
        ) : null}

        <Button asChild className="flex-1">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  );
};
