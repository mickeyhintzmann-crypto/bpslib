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
    viewBox="0 0 640 560"
    role="img"
    aria-label="Danmarkskort med markering af Sjælland"
    className="mx-auto h-44 w-full max-w-[280px]"
  >
    <g fill="hsl(var(--foreground) / 0.9)" stroke="hsl(var(--background))" strokeWidth="8">
      <path d="M108 66L148 50L181 57L200 89L235 117L236 151L261 181L250 227L271 271L255 318L228 349L206 372L194 414L171 463L136 488L99 474L79 440L61 409L57 364L72 322L62 284L75 247L101 216L110 183L95 149L101 116Z" />
      <path d="M218 437L235 429L250 440L247 458L230 467L215 456Z" />
      <path d="M283 353L315 344L343 357L356 386L347 414L318 433L287 424L270 398Z" />
      <path d="M360 251L402 229L452 226L497 246L521 281L528 325L510 364L476 392L431 398L386 381L359 350L349 305Z" />
      <path d="M372 410L414 397L461 405L484 429L478 455L446 473L400 470L375 446Z" />
      <path d="M484 422L513 414L541 428L545 455L527 476L495 476L478 454Z" />
      <path d="M447 374L467 367L485 377L486 396L468 405L450 395Z" />
      <path d="M533 255L562 243L590 256L597 284L579 307L549 310L531 290Z" />
      <path d="M347 170L365 163L384 173L380 192L359 198L343 188Z" />
      <path d="M336 229L349 224L358 232L352 245L339 246L332 236Z" />
    </g>
    <path
      d="M360 251L402 229L452 226L497 246L521 281L528 325L510 364L476 392L431 398L386 381L359 350L349 305Z"
      fill="hsl(var(--primary) / 0.2)"
      stroke="hsl(var(--primary))"
      strokeWidth="6"
    />
    <circle cx="439" cy="313" r="6" fill="hsl(var(--primary))" />
    <text x="394" y="518" className="fill-foreground text-[28px] font-semibold">
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
