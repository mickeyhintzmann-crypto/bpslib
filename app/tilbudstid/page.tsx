import { PageShell } from "@/components/PageShell";
import { OfferTimeForm } from "@/components/offer/OfferTimeForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tilbudstid",
  description: "Få et hurtigt tilbud på opgaver uden for bordplader. Vi vender tilbage med en konkret pris.",
  path: "/tilbudstid"
});

export default function TilbudstidPage() {
  return (
    <PageShell title="Tilbudstid for øvrige fag">
      <p>
        Har du en opgave inden for gulv, maler, murer eller tømrer? Send en kort beskrivelse, så
        vender vi tilbage med et tilbud.
      </p>
      <p>Online booking er ikke aktiv i MVP, men vi svarer hurtigt på din forespørgsel.</p>
      <OfferTimeForm />
    </PageShell>
  );
}
