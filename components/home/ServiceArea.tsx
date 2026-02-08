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

export const ServiceArea = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Serviceområde på Sjælland</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Vi kører i hele Sjælland og planlægger ruterne, så du får en tid uden unødvendig ventetid.
          Uanset om du bor i byen eller i en mindre kommune, kan vi hjælpe med bordpladeslibning i
          massiv træ. Vi prioriterer få, men rigtige opgaver, hvor finishen og holdbarheden holder.
          Derfor bruger vi tid på at forstå din bordplade, før vi går i gang. Vi kan ofte kombinere
          flere besøg i samme område, så kalenderen bliver fleksibel. Kontakt os, hvis du er i tvivl
          om vi dækker dit område.
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
      <div className="mt-4">
        <Link href="/bordpladeslibning-sjaelland" className="text-sm font-semibold text-primary">
          Se alle områder
        </Link>
      </div>
    </section>
  );
};
