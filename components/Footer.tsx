import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { trustAssets } from "@/lib/assets";
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
    <footer className="border-t border-stone-700/70 bg-stone-900 text-stone-100">
      <div className="mx-auto w-full max-w-[1180px] px-6 py-14">
        <div className="flex flex-col gap-6 border-b border-stone-700 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <BpsImage
              src="/media/logo.bpslib/bpslib.logo.png"
              alt={`${siteConfig.companyName} logo`}
              width={170}
              height={50}
              className="h-10 w-auto"
            />
            <p className="mt-3 max-w-xl text-sm text-stone-300">
              Bordplade i massiv træ, gulv og øvrige fag med tydelig plan, hurtig dialog og solid udførelse.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/bordpladeslibning/prisberegner"
              className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
            >
              Få pris via billeder
            </Link>
            <Link
              href="/tilbudstid"
              className="inline-flex items-center rounded-full border border-stone-500 bg-stone-800 px-5 py-2.5 text-sm font-semibold text-stone-100 transition hover:border-stone-300"
            >
              Book tilbudstid
            </Link>
          </div>
        </div>

        <div className="grid gap-8 pt-8 md:grid-cols-2 lg:grid-cols-4">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Kontakt</p>
            <div className="mt-3 space-y-2 text-sm text-stone-300">
              <p>
                Telefon:{" "}
                <a href={`tel:${siteConfig.phone}`} className="font-semibold text-stone-100 hover:text-primary">
                  {siteConfig.phoneDisplay}
                </a>
              </p>
              <p>
                Email:{" "}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="font-semibold text-stone-100 hover:text-primary"
                >
                  {siteConfig.email}
                </a>
              </p>
              <p>CVR: {siteConfig.cvr}</p>
              <p>Hverdage: {siteConfig.openingHours.weekdays}</p>
              <p>Weekend: {siteConfig.openingHours.weekend}</p>
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Bordplade</p>
            <div className="mt-3 grid gap-2 text-sm text-stone-300">
              {bordpladeLinks.map((route) => (
                <Link key={route.href} href={route.href} className="transition hover:text-stone-100">
                  {route.label}
                </Link>
              ))}
              <Link href="/bordpladeslibning/omraader" className="font-semibold text-stone-100 hover:text-primary">
                Se alle områder
              </Link>
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Gulv og øvrige fag</p>
            <div className="mt-3 grid gap-2 text-sm text-stone-300">
              {gulvLinks.map((route) => (
                <Link key={route.href} href={route.href} className="transition hover:text-stone-100">
                  {route.label}
                </Link>
              ))}
              <Link href="/gulvafslibning/omraader" className="font-semibold text-stone-100 hover:text-primary">
                Se alle gulv-områder
              </Link>
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Virksomhed</p>
            <div className="mt-3 grid gap-2 text-sm text-stone-300">
              {legalLinks.map((route) => (
                <Link key={route.href} href={route.href} className="transition hover:text-stone-100">
                  {route.label}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-stone-700 pt-5 text-xs text-stone-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.companyName}. Alle rettigheder forbeholdes.</p>
          {siteConfig.anmeldHaandvaerker.enabled && siteConfig.anmeldHaandvaerker.profileUrl ? (
            <Link href={siteConfig.anmeldHaandvaerker.profileUrl} target="_blank" rel="noopener noreferrer">
              <BpsImage
                src={trustAssets.anmeldHaandvaerkerBadge}
                alt="Anmeld-håndværker badge"
                width={220}
                height={100}
                className="h-8 w-auto"
              />
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
};
