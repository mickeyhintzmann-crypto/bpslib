import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { FooterCityCoverage } from "@/components/footer/FooterCityCoverage";
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

  const bordpladeCityLinks = footerRegistry.bordplade.filter((route) => isBordpladeCity(route.href));
  const gulvCityLinks = footerRegistry.gulvOgFag.filter((route) => isGulvCity(route.href));

  const bordpladeLinks = footerRegistry.bordplade.filter((route) => !isBordpladeCity(route.href));
  const gulvLinks = footerRegistry.gulvOgFag.filter((route) => !isGulvCity(route.href));

  return (
    <footer className="border-t border-stone-700/70 bg-[linear-gradient(160deg,hsl(28_24%_14%),hsl(22_20%_10%)_55%,hsl(20_18%_8%)_100%)] text-stone-200">
      <div className="mx-auto w-full max-w-[1180px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <div className="rounded-2xl border border-stone-600/60 bg-white/95 p-4 text-foreground">
              <BpsImage
                src={brandAssets.logo}
                alt={`${siteConfig.companyName} logo`}
                width={160}
                height={48}
                className="h-10 w-auto"
              />
              <p className="mt-3 font-display text-lg font-semibold">{siteConfig.companyName}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Bordpladeslibning i massiv træ med fokus på finish, holdbarhed og hurtig dialog.
              </p>
            </div>
            <div className="space-y-2 text-sm text-stone-300">
              <p>Telefon: {siteConfig.phoneDisplay}</p>
              <p>Email: {siteConfig.email}</p>
              <p>CVR: {siteConfig.cvr}</p>
            </div>
            <div className="space-y-1 text-sm text-stone-300">
              <p>Hverdage: {siteConfig.openingHours.weekdays}</p>
              <p>Weekend: {siteConfig.openingHours.weekend}</p>
            </div>
            {siteConfig.anmeldHaandvaerker.enabled && siteConfig.anmeldHaandvaerker.profileUrl ? (
              <div className="pt-3">
                <Link
                  href={siteConfig.anmeldHaandvaerker.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3"
                >
                  <BpsImage
                    src={trustAssets.anmeldHaandvaerkerBadge}
                    alt="Anmeld-håndværker badge"
                    width={220}
                    height={100}
                    className="h-10 w-auto"
                  />
                </Link>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Bordplade</p>
            <div className="grid gap-2 text-stone-300">
              {bordpladeLinks.map((route) => (
                <Link key={route.href} href={route.href} className="transition hover:text-white">
                  {route.label}
                </Link>
              ))}
              <Link
                href="/bordpladeslibning/omraader"
                className="font-semibold text-stone-100 transition hover:text-white"
              >
                Se alle områder
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Gulv og øvrige fag</p>
            <div className="grid gap-2 text-stone-300">
              {gulvLinks.map((route) => (
                <Link key={route.href} href={route.href} className="transition hover:text-white">
                  {route.label}
                </Link>
              ))}
              <Link
                href="/gulvafslibning/omraader"
                className="font-semibold text-stone-100 transition hover:text-white"
              >
                Se alle gulv-områder
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Virksomhed og juridisk</p>
            <div className="grid gap-2 text-stone-300">
              {footerRegistry.core.map((route) => (
                <Link key={route.href} href={route.href} className="transition hover:text-white">
                  {route.label}
                </Link>
              ))}
              {footerRegistry.legal.map((route) => (
                <Link key={route.href} href={route.href} className="transition hover:text-white">
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <FooterCityCoverage bordpladeCities={bordpladeCityLinks} gulvCities={gulvCityLinks} />
      </div>
      <div className="border-t border-stone-700/70 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {siteConfig.companyName}. Alle rettigheder forbeholdes.
      </div>
    </footer>
  );
};
