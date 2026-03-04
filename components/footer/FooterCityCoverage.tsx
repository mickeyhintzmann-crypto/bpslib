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
    viewBox="0 0 220 180"
    role="img"
    aria-label="Forenklet Danmarkskort"
    className="mx-auto h-40 w-full max-w-[220px]"
  >
    <path
      d="M40 15C22 30 20 52 32 72C39 83 36 95 30 108C22 126 25 146 41 160C56 172 75 167 88 153C97 143 98 129 102 116C106 102 113 92 119 83C130 66 126 43 112 31C98 20 86 21 73 17C61 13 50 10 40 15Z"
      fill="hsl(var(--muted))"
      stroke="hsl(var(--border))"
      strokeWidth="2"
    />
    <ellipse
      cx="134"
      cy="112"
      rx="22"
      ry="28"
      fill="hsl(var(--muted))"
      stroke="hsl(var(--border))"
      strokeWidth="2"
    />
    <ellipse
      cx="169"
      cy="98"
      rx="14"
      ry="18"
      fill="hsl(var(--primary) / 0.22)"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
    />
    <circle cx="176" cy="96" r="3.5" fill="hsl(var(--primary))" />
    <text x="153" y="138" className="fill-foreground text-[11px] font-semibold">
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
    <section className="rounded-3xl border border-stone-700/70 bg-stone-950/35 p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-start">
        <div className="rounded-2xl border border-stone-700/70 bg-stone-900/45 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
            Dækning på Sjælland
          </p>
          <p className="mt-2 text-sm text-stone-300">
            Kompakt oversigt over by-links. Alle URL&apos;er er uændrede.
          </p>
          <div className="mt-3">
            <DenmarkMiniMap />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-semibold text-stone-100">Byer på Sjælland</h3>
              <p className="mt-1 text-sm text-stone-300">{serviceMeta[activeService].intro}</p>
            </div>
            <div className="inline-flex rounded-full border border-stone-700/70 bg-stone-900/40 p-1">
              {(["bordplade", "gulv"] as const).map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => setActiveService(service)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                    activeService === service
                      ? "bg-primary text-primary-foreground"
                      : "text-stone-300 hover:text-white"
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
                  className="group flex items-center justify-between rounded-xl border border-stone-700/70 bg-stone-900/40 px-3 py-2 text-sm text-stone-200 transition hover:border-stone-500 hover:text-white"
                >
                  <span>{route.label}</span>
                  <span className="text-xs text-stone-500 transition group-hover:text-stone-300">{">"}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 rounded-full border border-stone-700/70 bg-stone-900/40 p-1">
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={`${activeService}-page-${index + 1}`}
                  type="button"
                  onClick={() => setActivePage((current) => ({ ...current, [activeService]: index }))}
                  className={`h-8 min-w-8 rounded-full px-2 text-xs font-semibold transition ${
                    safePageIndex === index
                      ? "bg-primary text-primary-foreground"
                      : "text-stone-300 hover:text-white"
                  }`}
                  aria-label={`Vis side ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <Link
              href={serviceMeta[activeService].areasHref}
              className="rounded-full border border-stone-600/80 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:border-stone-400 hover:text-white"
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
