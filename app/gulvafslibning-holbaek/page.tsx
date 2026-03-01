import Link from "next/link";

import { ReferenceStrip } from "@/components/ReferenceStrip";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Kan I slibe flere rum på én gang?",
    answer:
      "Ja - det er ofte smartest. Vi planlægger rækkefølgen, så det fungerer praktisk med adgang og tørring."
  },
  {
    question: "Hvad hvis gulvet er meget ujævnt eller har dybe hak?",
    answer:
      "Så kan afhøvling eller ekstra forarbejde være nødvendigt. Det vurderer vi på tilbudstiden."
  },
  {
    question: "Hvad koster det?",
    answer:
      "Det afhænger af m², gulvtype, tilstand og efterbehandling. Du får et konkret tilbud efter vurdering."
  },
  {
    question: "Skal vi være hjemme under arbejdet?",
    answer:
      "Det kommer an på adgang. Mange vælger at være væk i arbejdstiden - vi aftaler det praktiske på forhånd."
  },
  {
    question: "Kan I hjælpe i Tuse/Vipperød/Jyderup?",
    answer:
      "Ja - vi dækker hele området og planlægger ruter og opgaver samlet."
  },
  {
    question: "Hvilken finish er mest \"nem\"?",
    answer:
      "Lak er typisk nemmest i drift. Olie og sæbe giver flotte udtryk, men kræver mere løbende pleje."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning i Holbæk | Uforpligtende tilbud | BP Slib",
  description:
    "Gulvafslibning i Holbæk og omegn. Uforpligtende tilbud baseret på gulvtype, m² og finish. Erfaring fra større kunder som Rigshospitalets Patienthotel og Skatteministeriet. Book tilbudstid.",
  path: "/gulvafslibning-holbaek"
});

export default function GulvHolbaekPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvafslibning i Holbæk
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi hjælper med gulvafslibning i Holbæk og omegn - både i helårshuse og boliger, hvor
          gulvene har taget imod mange års slid. Nøglen til et flot resultat er korrekt vurdering af
          gulvets tilstand, gulvtype og den finish, der passer til din hverdag.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Du får et uforpligtende tilbud baseret på m², tilstand og ønsket efterbehandling (lak, olie
          eller sæbe). Vi afklarer adgang og praktiske forhold, så du får en realistisk plan og et
          forløb uden overraskelser.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Erfaring fra større projekter: Rigshospitalets Patienthotel, Brdr. Price Tivoli,
          Skatteministeriet og Boldens Gård.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tilbudstid">Book tilbudstid</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/kontakt">Kontakt os</Link>
          </Button>
        </div>
      </section>

      <ReferenceStrip />

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Eksempel på opgave i området</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">Udgangspunkt:</span> Plankegulv med synlige ridser, slidfelter og ujævn glans.
          </li>
          <li>
            <span className="font-semibold text-foreground">Løsning:</span> Slibning i trin + finishvalg ud fra brug (lak ved høj slid, olie ved naturligt look).
          </li>
          <li>
            <span className="font-semibold text-foreground">Resultat:</span> Ensartet overflade og et gulv der er nemmere at vedligeholde.
          </li>
        </ul>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Hvad vi hjælper med</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Gulvslibning og opfriskning</li>
            <li>Afhøvling ved dybe skader</li>
            <li>Lak, olie eller sæbebehandling</li>
            <li>Udbedring af ridser og pletter</li>
          </ul>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Pris</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Prisen afhænger af gulvtype, areal og behandling. Se vores{" "}
            <Link href="/gulvafslibning/pris" className="font-medium text-foreground hover:text-primary">
              pris-side
            </Link>
            , og læs om finishmuligheder som{" "}
            <Link href="/gulvafslibning/lak" className="font-medium text-foreground hover:text-primary">
              lak
            </Link>
            ,{" "}
            <Link href="/gulvafslibning/olie" className="font-medium text-foreground hover:text-primary">
              olie
            </Link>
            , eller{" "}
            <Link href="/gulvafslibning/saebe" className="font-medium text-foreground hover:text-primary">
              sæbe
            </Link>
            . Vi hjælper også med{" "}
            <Link href="/gulvafslibning/ridser" className="font-medium text-foreground hover:text-primary">
              ridser og pletter
            </Link>
            .
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder vi dækker</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Holbæk, Tuse, Vipperød, Svinninge, Jyderup, Mørkøv, Kalundborg (nært).
        </p>
      </section>

      <FaqSection
        items={faqItems}
        title="Ofte stillede spørgsmål om gulvafslibning"
        intro="Svarene her giver et hurtigt overblik før du booker tilbudstid."
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
