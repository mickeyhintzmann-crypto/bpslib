"use client";

import { useState } from "react";
import Link from "next/link";

import { NavDropdown } from "@/components/NavDropdown";
import { Button } from "@/components/ui/button";
import { getRouteByPath, headerRegistry } from "@/lib/site-registry";
import { siteConfig } from "@/lib/site-config";
import { trackEvent } from "@/lib/tracking";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = () => setIsOpen(false);
  const bookingRoute = getRouteByPath("/bordpladeslibning/book");
  const tilbudRoute = getRouteByPath("/tilbudstid");
  const tilbudCta = tilbudRoute ? { href: tilbudRoute.path, label: "Få tilbud" } : undefined;
  const bookingCta = bookingRoute ? { href: bookingRoute.path, label: "Book nu" } : undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 shadow-[0_8px_24px_hsl(20_30%_20%/0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/88">
      <div className="hidden border-b border-border/40 bg-[linear-gradient(90deg,hsl(28_26%_18%),hsl(24_22%_13%))] md:block">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-6 py-2 text-xs text-stone-300">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${siteConfig.phone}`}
              className="rounded-full px-2 py-1 transition hover:text-white"
              onClick={() => trackEvent("call_click", { source: "header_topbar" })}
            >
              Tlf. {siteConfig.phoneDisplay}
            </a>
            {siteConfig.showSvarSammeDag ? <span>{siteConfig.topbarMessage}</span> : null}
          </div>
          <span>Åbningstid: {siteConfig.openingHours.weekdays}</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="rounded-2xl border border-stone-800/60 bg-[linear-gradient(155deg,hsl(28_26%_18%),hsl(22_24%_12%))] px-3 py-2 text-lg font-semibold tracking-tight text-white shadow-[0_10px_24px_hsl(20_35%_10%/0.35)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            BP Slib
            <span className="sr-only">{siteConfig.companyName}</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavDropdown
              label="Bordplade"
              items={headerRegistry.bordplade.map((route) => ({ href: route.href, label: route.label }))}
              cta={{ href: headerRegistry.cta.href, label: "AI-prisberegner" }}
              emphasis
            />
            <NavDropdown
              label="Gulvafslibning"
              items={headerRegistry.gulv.map((route) => ({ href: route.href, label: route.label }))}
              cta={tilbudCta}
            />
            <NavDropdown
              label="Flere fag"
              items={headerRegistry.fag.map((route) => ({ href: route.href, label: route.label }))}
              cta={tilbudCta}
            />
            {headerRegistry.core.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="relative text-sm font-medium text-muted-foreground transition hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href={`tel:${siteConfig.phone}`}
            className="hidden rounded-xl border border-border/70 bg-white px-3.5 py-2 text-sm text-muted-foreground transition hover:text-foreground lg:inline"
            onClick={() => trackEvent("call_click", { source: "header_main" })}
          >
            Tlf. {siteConfig.phoneDisplay}
          </a>
          {bookingCta ? (
            <Button
              asChild
              className="hidden sm:inline-flex h-11 rounded-xl bg-primary px-5 text-white shadow-[0_12px_22px_hsl(var(--primary)/0.36)] hover:-translate-y-0.5 hover:bg-primary/90"
            >
              <Link href={bookingCta.href}>{bookingCta.label}</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="hidden h-11 rounded-xl border-border/85 bg-white sm:inline-flex">
            <Link href={headerRegistry.cta.href}>AI-prisberegner</Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/80 bg-white px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobilmenu"
          >
            {isOpen ? "Luk" : "Menu"}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div id="mobilmenu" className="border-t border-border/70 bg-[linear-gradient(180deg,hsl(30_27%_96%),hsl(28_24%_93%))] shadow-[0_18px_34px_hsl(20_30%_20%/0.1)] md:hidden">
          <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-6 py-6">
            <NavDropdown
              label="Bordplade"
              items={headerRegistry.bordplade.map((route) => ({ href: route.href, label: route.label }))}
              cta={{ href: headerRegistry.cta.href, label: "AI-prisberegner" }}
              variant="mobile"
              onNavigate={handleNavigate}
            />
            <NavDropdown
              label="Gulvafslibning"
              items={headerRegistry.gulv.map((route) => ({ href: route.href, label: route.label }))}
              cta={tilbudCta}
              variant="mobile"
              onNavigate={handleNavigate}
            />
            <NavDropdown
              label="Flere fag"
              items={headerRegistry.fag.map((route) => ({ href: route.href, label: route.label }))}
              cta={tilbudCta}
              variant="mobile"
              onNavigate={handleNavigate}
            />
            <div className="grid gap-3 text-sm font-medium text-foreground">
              {headerRegistry.core.map((route) => (
                <Link key={route.href} href={route.href} onClick={handleNavigate}>
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};
