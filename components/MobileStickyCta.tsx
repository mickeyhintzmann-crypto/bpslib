"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";

const PHONE_TEL = "tel:+45XXXXXXXX";

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
          <a href={PHONE_TEL} onClick={() => trackEvent("call_click", { source: "mobile_sticky" })}>
            Ring
          </a>
        </Button>
      </div>
    </div>
  );
};
