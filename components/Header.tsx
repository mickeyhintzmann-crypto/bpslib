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
    <header className="border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="hidden border-b border-border/70 bg-white/60 md:block">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${siteConfig.phone}`}
              className="hover:text-foreground"
              onClick={() => trackEvent("call_click", { source: "header_topbar" })}
            >
              Tlf. {siteConfig.phoneDisplay}
            </a>
            {siteConfig.showSvarSammeDag ? <span>{siteConfig.topbarMessage}</span> : null}
          </div>
          <span>Åbningstid: {siteConfig.openingHours.weekdays}</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
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
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`tel:${siteConfig.phone}`}
            className="hidden text-sm text-muted-foreground lg:inline"
            onClick={() => trackEvent("call_click", { source: "header_main" })}
          >
            Tlf. {siteConfig.phoneDisplay}
          </a>
          {bookingCta ? (
            <Button
              asChild
              className="hidden sm:inline-flex bg-primary px-5 text-white shadow-md hover:bg-primary/90"
            >
              <Link href={bookingCta.href}>{bookingCta.label}</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href={headerRegistry.cta.href}>AI-prisberegner</Link>
          </Button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobilmenu"
          >
            {isOpen ? "Luk" : "Menu"}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div id="mobilmenu" className="border-t border-border/70 bg-white/80 md:hidden">
          <div className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-6">
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
