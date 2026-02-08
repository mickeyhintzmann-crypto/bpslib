import Link from "next/link";

import { footerRegistry } from "@/lib/site-registry";
import { siteConfig } from "@/lib/site-config";

export const Footer = () => {
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
            <p>Adresse: {siteConfig.address}</p>
            <p>Telefon: {siteConfig.phoneDisplay}</p>
            <p>Email: {siteConfig.email}</p>
            <p>CVR: {siteConfig.cvr}</p>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Hverdage: {siteConfig.openingHours.weekdays}</p>
            <p>Weekend: {siteConfig.openingHours.weekend}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">Bordplade</p>
          <div className="grid gap-2 text-muted-foreground">
            {footerRegistry.bordplade.map((route) => (
              <Link key={route.href} href={route.href} className="hover:text-foreground">
                {route.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">Gulv og øvrige fag</p>
          <div className="grid gap-2 text-muted-foreground">
            {footerRegistry.gulvOgFag.map((route) => (
              <Link key={route.href} href={route.href} className="hover:text-foreground">
                {route.label}
              </Link>
            ))}
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
