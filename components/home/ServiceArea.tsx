import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

const areas = [
  { label: "København", href: "/bordpladeslibning-koebenhavn" },
  { label: "Frederiksberg", href: "/bordpladeslibning-frederiksberg" },
  { label: "Gentofte", href: "/bordpladeslibning-gentofte" },
  { label: "Lyngby", href: "/bordpladeslibning-lyngby" },
  { label: "Roskilde", href: "/bordpladeslibning-roskilde" },
  { label: "Køge", href: "/bordpladeslibning-koege" },
  { label: "Næstved", href: "/bordpladeslibning-naestved" },
  { label: "Slagelse", href: "/bordpladeslibning-slagelse" },
  { label: "Holbæk", href: "/bordpladeslibning-holbaek" },
  { label: "Hillerød", href: "/bordpladeslibning-hilleroed" }
];

export const ServiceArea = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Serviceområde på Sjælland</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Vi kører i hele Sjælland og planlægger ruterne, så du får en tid uden unødvendig ventetid.
          Uanset om du bor i byen eller i en mindre kommune, kan vi hjælpe med bordpladeslibning i
          massiv træ. Vi prioriterer få, men rigtige opgaver, hvor finish og holdbarhed holder. Vi
          bruger tid på at forstå din bordplade, før vi går i gang, så du får den rigtige løsning.
        </p>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {siteConfig.showSvarSammeDag
            ? "Vi svarer typisk samme dag på henvendelser og billeder, så du hurtigt får afklaring."
            : "Vi vender hurtigt tilbage, når du sender billeder eller spørgsmål."}{" "}
          Ring eller skriv, hvis du har særlige ønsker til tid, adgang eller materialevalg.
        </p>
      </div>
      <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 md:grid-cols-5">
        {areas.map((area) => (
          <Link
            key={area.href}
            href={area.href}
            className="rounded-full border border-border/70 px-3 py-2 text-center hover:text-foreground"
          >
            {area.label}
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <Link href="/bordpladeslibning/omraader" className="text-sm font-semibold text-primary">
          Se alle områder
        </Link>
      </div>
    </section>
  );
};
