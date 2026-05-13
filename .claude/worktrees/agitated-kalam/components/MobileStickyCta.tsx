"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CONTACT_TEL_HREF } from "@/lib/contact";
import { trackEvent } from "@/lib/tracking";

export const MobileStickyCta = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3">
        <Button asChild className="flex-1">
          <Link href="/bordpladeslibning/prisberegner">Få pris</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/bordpladeslibning/book">Book tid</Link>
        </Button>
        <Button asChild variant="secondary" className="flex-1">
          <a href={CONTACT_TEL_HREF} onClick={() => trackEvent("call_click", { source: "mobile_sticky" })}>
            Ring
          </a>
        </Button>
      </div>
    </div>
  );
};
