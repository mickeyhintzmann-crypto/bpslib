import Link from "next/link";

const areas = [
  "København",
  "Frederiksberg",
  "Roskilde",
  "Køge",
  "Næstved",
  "Slagelse",
  "Holbæk",
  "Hillerød",
  "Helsingør",
  "Greve"
];

export const ServiceAreaGrid = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Vi dækker hele Sjælland</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Vi kører på hele Sjælland med fokus på stabile aftaler og realistiske tider. Om du bor i
          København, Roskilde, Næstved eller en mindre by, planlægger vi opgaven så du får et
          tydeligt forløb fra vurdering til færdig overflade. Vi prioriterer kvalitet frem for
          hastværk, og derfor får du altid en ærlig anbefaling af behandling, tørretid og vedligehold.
        </p>
      </div>
      <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 md:grid-cols-5">
        {areas.map((area) => (
          <Link
            key={area}
            href="/bordpladeslibning-sjaelland"
            className="rounded-full border border-border/70 px-3 py-2 text-center hover:text-foreground"
          >
            {area}
          </Link>
        ))}
      </div>
      <div className="mt-5">
        <Link href="/bordpladeslibning-sjaelland" className="text-sm font-semibold text-primary">
          Se alle områder
        </Link>
      </div>
    </section>
  );
};
