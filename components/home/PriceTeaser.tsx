import Link from "next/link";

import { Button } from "@/components/ui/button";

export const PriceTeaser = () => {
  return (
    <section className="grid gap-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-16">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Vil du kende prisen før du booker?</h2>
        <p className="text-sm text-muted-foreground">
          Vi giver altid en ærlig vurdering, før arbejdet starter. Normalprisen for en
          køkkenbordplade begynder typisk ved 3.500 kr., og små køkkener kan lande omkring 3.000 kr.
          Vi ligger ikke over 5.000 kr. for selve køkkenbordpladen – hvis totalen bliver højere, er
          det fordi du vælger ekstra elementer som spisebord, sofabord, vandfald eller
          vindueskarme.
        </p>
        <p className="text-sm text-muted-foreground">
          Prisen påvirkes især af bordpladens mål, tilstand og hvilken finish du ønsker (olie eller
          lak). Vi kan også lave sæbebehandling, men vi anbefaler den sjældent til køkkenbordplader
          med høj daglig brug.
        </p>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>• Bordpladens mål og tykkelse</li>
          <li>• Tilstand, skjolder og ridser</li>
          <li>• Ønsket finish og behandling</li>
          <li>• Ekstra elementer som vandfald, lister eller bryggers</li>
        </ul>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white/70 p-6">
        <p className="text-sm text-muted-foreground">
          Se prisguiden for overblik og detaljer, eller upload billeder hvis du vil have et
          konkret overslag.
        </p>
        <div className="rounded-xl border border-border/70 bg-white/90 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Pris‑eksempler (vejledende)</p>
          <ul className="mt-2 grid gap-2">
            <li>• Små/alm. køkkener: ca. 3.000–4.000 kr.</li>
            <li>• Stort køkken eller køkken med vandfald: ca. 4.000–5.000 kr.</li>
            <li>• Ekstra elementer prissættes separat (fx spisebord eller vindueskarme).</li>
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/pris">Se prisguide</Link>
          </Button>
          <Link href="/bordpladeslibning/prisberegner" className="text-sm font-semibold text-primary">
            Få et overslag via billeder
          </Link>
        </div>
      </div>
    </section>
  );
};
