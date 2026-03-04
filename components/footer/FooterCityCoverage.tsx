"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { RegistryLink } from "@/lib/site-registry";

type ServiceKey = "bordplade" | "gulv";

const PAGE_SIZE = 10;

const chunk = <T,>(items: T[], size: number) => {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }
  return groups.length > 0 ? groups : [[]];
};

const serviceMeta: Record<
  ServiceKey,
  { label: string; areasHref: string; areasLabel: string; intro: string }
> = {
  bordplade: {
    label: "Bordplade",
    areasHref: "/bordpladeslibning/omraader",
    areasLabel: "Se alle bordplade-områder",
    intro: "By-sider for bordpladeslibning i massiv træ."
  },
  gulv: {
    label: "Gulvafslibning",
    areasHref: "/gulvafslibning/omraader",
    areasLabel: "Se alle gulv-områder",
    intro: "By-sider for gulvafslibning på Sjælland."
  }
};

const DenmarkMiniMap = () => (
  <svg
    viewBox="0 0 420 420"
    role="img"
    aria-label="Danmarkskort med markering af Sjælland"
    className="mx-auto h-44 w-full max-w-[280px]"
  >
    <g fill="hsl(var(--foreground) / 0.86)" stroke="hsl(var(--background))" strokeWidth="6">
      <path d="M98 28L132 34L154 55L152 82L171 106L168 129L178 150L169 177L149 196L148 226L133 257L118 297L95 317L69 318L50 300L35 268L32 239L39 207L31 182L38 156L58 137L70 118L62 92L69 66L84 46Z" />
      <path d="M177 239L199 232L216 239L222 257L217 279L200 294L179 286L171 268Z" />
      <path d="M237 188L260 173L294 168L320 182L335 209L336 237L323 262L296 278L267 280L244 267L231 243L229 214Z" />
      <path d="M239 298L260 288L282 292L293 307L290 327L273 337L250 334L238 319Z" />
      <path d="M304 307L325 297L348 304L354 323L342 340L318 343L301 332Z" />
      <path d="M356 175L372 170L386 180L383 197L367 204L352 196Z" />
    </g>
    <path
      d="M237 188L260 173L294 168L320 182L335 209L336 237L323 262L296 278L267 280L244 267L231 243L229 214Z"
      fill="hsl(var(--primary) / 0.16)"
      stroke="hsl(var(--primary))"
      strokeWidth="4"
    />
    <circle cx="286" cy="223" r="5" fill="hsl(var(--primary))" />
    <text x="252" y="352" className="fill-foreground text-[18px] font-semibold">
      Sjælland
    </text>
  </svg>
);

export const FooterCityCoverage = ({
  bordpladeCities,
  gulvCities
}: {
  bordpladeCities: RegistryLink[];
  gulvCities: RegistryLink[];
}) => {
  const cityPages = useMemo(
    () => ({
      bordplade: chunk(bordpladeCities, PAGE_SIZE),
      gulv: chunk(gulvCities, PAGE_SIZE)
    }),
    [bordpladeCities, gulvCities]
  );

  const [activeService, setActiveService] = useState<ServiceKey>("bordplade");
  const [activePage, setActivePage] = useState<Record<ServiceKey, number>>({
    bordplade: 0,
    gulv: 0
  });

  const currentPageIndex = activePage[activeService];
  const currentPages = cityPages[activeService];
  const safePageIndex = Math.min(currentPageIndex, Math.max(currentPages.length - 1, 0));
  const currentItems = currentPages[safePageIndex] || [];
  const pageCount = currentPages.length;

  return (
    <section className="rounded-3xl border border-border/70 bg-transparent p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-start">
        <div className="rounded-2xl border border-border/70 bg-transparent p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Dækning på Sjælland
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Kompakt oversigt over by-links. Alle URL&apos;er er uændrede.
          </p>
          <div className="mt-3">
            <DenmarkMiniMap />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-semibold text-foreground">Byer på Sjælland</h3>
              <p className="mt-1 text-sm text-muted-foreground">{serviceMeta[activeService].intro}</p>
            </div>
            <div className="inline-flex rounded-full border border-border/80 bg-background/70 p-1">
              {(["bordplade", "gulv"] as const).map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => setActiveService(service)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                    activeService === service
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {serviceMeta[service].label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {currentItems.map((route) => (
                <Link
                  key={`${activeService}-${route.href}`}
                  href={route.href}
                  className="group flex items-center justify-between rounded-xl border border-border/80 bg-background/60 px-3 py-2 text-sm text-foreground transition hover:border-primary/50"
                >
                  <span>{route.label}</span>
                  <span className="text-xs text-muted-foreground transition group-hover:text-foreground">{">"}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/60 p-1">
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={`${activeService}-page-${index + 1}`}
                  type="button"
                  onClick={() => setActivePage((current) => ({ ...current, [activeService]: index }))}
                  className={`h-8 min-w-8 rounded-full px-2 text-xs font-semibold transition ${
                    safePageIndex === index
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={`Vis side ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <Link
              href={serviceMeta[activeService].areasHref}
              className="rounded-full border border-border/80 bg-background/60 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/60"
            >
              {serviceMeta[activeService].areasLabel}
            </Link>
          </div>

          <div className="sr-only">
            <p>Alle by-links:</p>
            {bordpladeCities.map((route) => (
              <Link key={`seo-bordplade-${route.href}`} href={route.href}>
                {route.label}
              </Link>
            ))}
            {gulvCities.map((route) => (
              <Link key={`seo-gulv-${route.href}`} href={route.href}>
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
