import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { brandAssets, trustAssets } from "@/lib/assets";
import { footerRegistry } from "@/lib/site-registry";
import { siteConfig } from "@/lib/site-config";

export const Footer = () => {
  const bordpladeRegionPaths = new Set([
    "/bordpladeslibning-sjaelland",
    "/bordpladeslibning-koebenhavn-omegn",
    "/bordpladeslibning-amager",
    "/bordpladeslibning-nordsjaelland",
    "/bordpladeslibning-midtsjaelland",
    "/bordpladeslibning-vest-sydsjaelland"
  ]);
  const gulvRegionPaths = new Set([
    "/gulvafslibning-sjaelland",
    "/gulvafslibning-koebenhavn-omegn",
    "/gulvafslibning-amager",
    "/gulvafslibning-nordsjaelland",
    "/gulvafslibning-midtsjaelland",
    "/gulvafslibning-vest-sydsjaelland"
  ]);

  const isBordpladeCity = (href: string) =>
    href.startsWith("/bordpladeslibning-") &&
    !bordpladeRegionPaths.has(href) &&
    href !== "/bordpladeslibning/omraader";

  const isGulvCity = (href: string) =>
    href.startsWith("/gulvafslibning-") &&
    !gulvRegionPaths.has(href) &&
    href !== "/gulvafslibning/omraader";

  const bordpladeLinks = footerRegistry.bordplade.filter((route) => !isBordpladeCity(route.href));
  const gulvLinks = footerRegistry.gulvOgFag.filter((route) => !isGulvCity(route.href));
  const legalLinks = [...footerRegistry.core, ...footerRegistry.legal];

  return (
    <footer className="relative overflow-hidden border-t border-stone-700/60 bg-[radial-gradient(circle_at_10%_10%,hsl(23_84%_18%)_0%,hsl(25_38%_10%)_40%,hsl(28_32%_8%)_100%)] text-stone-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-84px] h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute right-[-84px] top-28 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/3 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] px-6 py-16">
        <section className="rounded-[32px] border border-stone-500/40 bg-white/10 p-6 shadow-[0_20px_80px_hsl(18_40%_6%/0.45)] backdrop-blur md:p-9">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <p className="inline-flex rounded-full border border-orange-300/40 bg-orange-400/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-100">
                BP Slib • Klar Til Næste Skridt
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Nederst på siden skal stadig føles som et stærkt førstehåndsindtryk.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-200/90 md:text-base">
                Få et hurtigt prisestimat via billeder, book en tid, eller tag direkte kontakt. Vi svarer
                hurtigt og planlægger opgaven, så forløbet er tydeligt fra start.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/bordpladeslibning/prisberegner"
                  className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_hsl(24_90%_48%/0.35)] transition hover:translate-y-[-1px] hover:brightness-110"
                >
                  Få pris via billeder
                </Link>
                <Link
                  href="/tilbudstid"
                  className="inline-flex items-center rounded-full border border-stone-200/45 bg-white/95 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-white hover:bg-white"
                >
                  Book tilbudstid
                </Link>
                <Link
                  href="/cases"
                  className="inline-flex items-center rounded-full border border-stone-300/40 bg-stone-900/40 px-5 py-2.5 text-sm font-semibold text-stone-100 transition hover:border-stone-100/70 hover:bg-stone-800/55"
                >
                  Se cases
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-stone-100/90">
                <span className="rounded-full border border-stone-300/35 bg-stone-800/35 px-3 py-1">
                  15+ års erfaring
                </span>
                <span className="rounded-full border border-stone-300/35 bg-stone-800/35 px-3 py-1">
                  Kun massiv træ ved bordplade
                </span>
                <span className="rounded-full border border-stone-300/35 bg-stone-800/35 px-3 py-1">
                  Svar hurtigt
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-300/30 bg-white/95 p-5 text-foreground shadow-[0_14px_42px_hsl(20_35%_12%/0.25)]">
              <BpsImage
                src={brandAssets.logo}
                alt={`${siteConfig.companyName} logo`}
                width={170}
                height={50}
                className="h-10 w-auto"
              />
              <p className="mt-3 text-sm text-muted-foreground">Direkte kontakt</p>
              <div className="mt-2 space-y-2 text-sm">
                <p>
                  Telefon:{" "}
                  <a href={`tel:${siteConfig.phone}`} className="font-semibold text-foreground hover:text-primary">
                    {siteConfig.phoneDisplay}
                  </a>
                </p>
                <p>
                  Email:{" "}
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {siteConfig.email}
                  </a>
                </p>
                <p>CVR: {siteConfig.cvr}</p>
              </div>
              <div className="mt-4 rounded-2xl border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
                <p>Hverdage: {siteConfig.openingHours.weekdays}</p>
                <p>Weekend: {siteConfig.openingHours.weekend}</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/kontakt"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:border-primary/50 hover:text-primary"
                >
                  Kontakt os
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <section className="rounded-3xl border border-stone-500/40 bg-stone-900/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">Bordplade</p>
            <div className="mt-3 grid gap-2 text-sm text-stone-100/90">
              {bordpladeLinks.map((route) => (
                <Link key={route.href} href={route.href} className="transition hover:text-white">
                  {route.label}
                </Link>
              ))}
              <Link href="/bordpladeslibning/omraader" className="font-semibold text-orange-200 hover:text-white">
                Se alle områder
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-stone-500/40 bg-stone-900/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">Gulv og Øvrige Fag</p>
            <div className="mt-3 grid gap-2 text-sm text-stone-100/90">
              {gulvLinks.map((route) => (
                <Link key={route.href} href={route.href} className="transition hover:text-white">
                  {route.label}
                </Link>
              ))}
              <Link href="/gulvafslibning/omraader" className="font-semibold text-orange-200 hover:text-white">
                Se alle gulv-områder
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-stone-500/40 bg-stone-900/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">Virksomhed & Jura</p>
            <div className="mt-3 grid gap-2 text-sm text-stone-100/90">
              {legalLinks.map((route) => (
                <Link key={route.href} href={route.href} className="transition hover:text-white">
                  {route.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-stone-500/40 bg-stone-900/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">Hurtige Veje</p>
            <div className="mt-3 grid gap-2 text-sm text-stone-100/90">
              <Link href="/bordpladeslibning/prisberegner" className="transition hover:text-white">
                AI-prisberegner
              </Link>
              <Link href="/akutte-tider" className="transition hover:text-white">
                Akutte tider
              </Link>
              <Link href="/guides" className="transition hover:text-white">
                Guides & råd
              </Link>
              <Link href="/anmeldelser" className="transition hover:text-white">
                Anmeldelser
              </Link>
              <Link href="/referencer" className="transition hover:text-white">
                Referencer
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-stone-500/40 pt-5 text-xs text-stone-300 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {siteConfig.companyName}. Alle rettigheder forbeholdes.</p>
          {siteConfig.anmeldHaandvaerker.enabled && siteConfig.anmeldHaandvaerker.profileUrl ? (
            <Link
              href={siteConfig.anmeldHaandvaerker.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-stone-500/40 bg-stone-900/40 px-3 py-2 transition hover:border-stone-200/60"
            >
              <BpsImage
                src={trustAssets.anmeldHaandvaerkerBadge}
                alt="Anmeld-håndværker badge"
                width={220}
                height={100}
                className="h-8 w-auto"
              />
              <span className="text-stone-100">Se vores profil</span>
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
};
