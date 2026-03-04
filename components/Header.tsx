"use client";

import { useState } from "react";
import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { NavDropdown } from "@/components/NavDropdown";
import { Button } from "@/components/ui/button";
import { getRouteByPath, headerRegistry } from "@/lib/site-registry";
import { siteConfig } from "@/lib/site-config";
import { trackEvent } from "@/lib/tracking";

const pickByPathOrder = <T extends { href: string }>(items: T[], paths: string[]) =>
  paths
    .map((path) => items.find((item) => item.href === path))
    .filter((item): item is T => Boolean(item));

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = () => setIsOpen(false);
  const bookingRoute = getRouteByPath("/bordpladeslibning/book");
  const tilbudRoute = getRouteByPath("/tilbudstid");
  const tilbudCta = tilbudRoute ? { href: tilbudRoute.path, label: "Få tilbud" } : undefined;
  const bookingCta = bookingRoute ? { href: bookingRoute.path, label: "Book nu" } : undefined;

  const bordpladeMenu = pickByPathOrder(headerRegistry.bordplade, [
    "/bordpladeslibning-sjaelland",
    "/bordpladeslibning/pris",
    "/bordpladeslibning/cases",
    "/bordpladeslibning/book",
    "/akutte-tider",
    "/bordpladeslibning/kan-det-slibes",
    "/bordpladeslibning/omraader"
  ]);

  const gulvafslibningMenu = pickByPathOrder(headerRegistry.gulv, [
    "/gulvafslibning-sjaelland",
    "/gulvafslibning/pris",
    "/gulvafslibning/cases",
    "/gulvafslibning/omraader"
  ]);

  const gulvbelaegningMenu = pickByPathOrder(headerRegistry.gulv, [
    "/gulvlaegning-sjaelland",
    "/gulvlaegning/pris",
    "/gulvlaegning/cases"
  ]);

  const toNavItems = (menu: { href: string; label: string }[]) =>
    menu.map((route) => ({
      href: route.href,
      label:
        route.href.endsWith("/cases")
          ? "Cases"
          : route.href.endsWith("/pris")
            ? "Pris"
            : route.label
    }));

  const corePrimary = pickByPathOrder(headerRegistry.core, ["/cases", "/referencer"]);
  const moreMenu = pickByPathOrder(headerRegistry.core, ["/guides", "/om-os", "/kontakt"]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 shadow-[0_8px_24px_hsl(20_30%_20%/0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/88">
      <div className="hidden border-b border-border/40 bg-[linear-gradient(90deg,hsl(28_26%_18%),hsl(24_22%_13%))] md:block">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-5 py-2 text-xs text-stone-300 lg:px-6">
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

      <div className="mx-auto flex w-full max-w-[1320px] items-center gap-4 px-5 py-3.5 lg:px-6">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center transition hover:opacity-90"
        >
          <BpsImage
            src="/images/brand/logo-cropped.png"
            alt={`${siteConfig.companyName} logo`}
            width={1638}
            height={733}
            className="max-w-none"
            style={{ width: "auto", height: "62px" }}
          />
          <span className="sr-only">{siteConfig.companyName}</span>
        </Link>
        <nav className="hidden flex-1 items-center justify-end gap-5 pl-8 font-sans md:flex lg:pl-12">
          <NavDropdown
            label="Bordplade"
            items={toNavItems(bordpladeMenu)}
            cta={{ href: headerRegistry.cta.href, label: "AI-prisberegner" }}
          />
            <NavDropdown
              label="Gulvafslibning"
              items={toNavItems(gulvafslibningMenu)}
              cta={tilbudCta}
            />
            <NavDropdown
              label="Gulvbelægning"
              items={toNavItems(gulvbelaegningMenu)}
              cta={tilbudCta}
            />
            <NavDropdown
              label="Flere fag"
              items={headerRegistry.fag.map((route) => ({ href: route.href, label: route.label }))}
              cta={tilbudCta}
            />
            {corePrimary.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="relative text-[15px] font-semibold tracking-[0.01em] text-muted-foreground transition hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                {route.label}
              </Link>
            ))}
            <NavDropdown label="Mere" items={moreMenu.map((route) => ({ href: route.href, label: route.label }))} />
        </nav>
        <div className="flex items-center gap-2.5">
          {bookingCta ? (
            <Button
              asChild
              className="hidden sm:inline-flex h-11 rounded-xl bg-primary px-5 text-white shadow-[0_12px_22px_hsl(var(--primary)/0.36)] hover:-translate-y-0.5 hover:bg-primary/90"
            >
              <Link href={bookingCta.href}>{bookingCta.label}</Link>
            </Button>
          ) : null}
          <Button
            asChild
            variant="outline"
            className="hidden h-11 rounded-xl border-border/85 bg-white sm:inline-flex"
          >
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
          <div className="mx-auto grid w-full max-w-[1320px] gap-4 px-5 py-6">
            <NavDropdown
              label="Bordplade"
              items={toNavItems(bordpladeMenu)}
              cta={{ href: headerRegistry.cta.href, label: "AI-prisberegner" }}
              variant="mobile"
              onNavigate={handleNavigate}
            />
            <NavDropdown
              label="Gulvafslibning"
              items={toNavItems(gulvafslibningMenu)}
              cta={tilbudCta}
              variant="mobile"
              onNavigate={handleNavigate}
            />
            <NavDropdown
              label="Gulvbelægning"
              items={toNavItems(gulvbelaegningMenu)}
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
              {corePrimary.map((route) => (
                <Link key={route.href} href={route.href} onClick={handleNavigate}>
                  {route.label}
                </Link>
              ))}
            </div>
            <NavDropdown
              label="Mere"
              items={moreMenu.map((route) => ({ href: route.href, label: route.label }))}
              variant="mobile"
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
};
