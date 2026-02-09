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

  const bordpladeLinks = footerRegistry.bordplade.reduce(
    (acc, route) => {
      if (!isBordpladeCity(route.href)) {
        acc.links.push(route);
        return acc;
      }
      if (acc.cityCount < 12) {
        acc.links.push(route);
        acc.cityCount += 1;
      }
      return acc;
    },
    { links: [] as typeof footerRegistry.bordplade, cityCount: 0 }
  ).links;

  const gulvLinks = footerRegistry.gulvOgFag.reduce(
    (acc, route) => {
      if (!isGulvCity(route.href)) {
        acc.links.push(route);
        return acc;
      }
      if (acc.cityCount < 12) {
        acc.links.push(route);
        acc.cityCount += 1;
      }
      return acc;
    },
    { links: [] as typeof footerRegistry.gulvOgFag, cityCount: 0 }
  ).links;

  return (
    <footer className="border-t border-border/70 bg-background/90">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-4">
        <div className="space-y-4">
          <div>
            <p className="font-display text-lg font-semibold">{siteConfig.companyName}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Bordpladeslibning i massiv træ med fokus på finish, holdbarhed og hurtig dialog.
            </p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Telefon: {siteConfig.phoneDisplay}</p>
            <p>Email: {siteConfig.email}</p>
            <p>CVR: {siteConfig.cvr}</p>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
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
          <p className="font-medium text-foreground">Bordplade</p>
          <div className="grid gap-2 text-muted-foreground">
            {bordpladeLinks.map((route) => (
              <Link key={route.href} href={route.href} className="hover:text-foreground">
                {isBordpladeCity(route.href) ? `Bordpladeslibning i ${route.label}` : route.label}
              </Link>
            ))}
            <Link href="/bordpladeslibning/omraader" className="font-medium text-foreground">
              Se alle områder
            </Link>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">Gulv og øvrige fag</p>
          <div className="grid gap-2 text-muted-foreground">
            {gulvLinks.map((route) => (
              <Link key={route.href} href={route.href} className="hover:text-foreground">
                {isGulvCity(route.href) ? `Gulvafslibning i ${route.label}` : route.label}
              </Link>
            ))}
            <Link href="/gulvafslibning/omraader" className="font-medium text-foreground">
              Se alle gulv-områder
            </Link>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">Virksomhed og juridisk</p>
          <div className="grid gap-2 text-muted-foreground">
            {footerRegistry.core.map((route) => (
              <Link key={route.href} href={route.href} className="hover:text-foreground">
                {route.label}
              </Link>
            ))}
            {footerRegistry.legal.map((route) => (
              <Link key={route.href} href={route.href} className="hover:text-foreground">
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border/70 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.companyName}. Alle rettigheder forbeholdes.
      </div>
    </footer>
  );
};
