import Link from "next/link";

import { ReferenceStrip } from "@/components/ReferenceStrip";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvor kan microcement bruges?",
    answer:
      "Microcement kan bruges på gulv, i bad og i køkken, når underlag og opbygning er korrekt for den konkrete anvendelse."
  },
  {
    question: "Kræver microcement særligt underlag?",
    answer:
      "Ja, underlaget skal være stabilt, rent og egnet til opbygningen. Vi vurderer altid underlaget, før vi anbefaler en løsning."
  },
  {
    question: "Hvad påvirker prisen på microcement?",
    answer:
      "Pris afhænger typisk af areal, underlagets tilstand, opbygningstykkelse, detaljer samt ønsket finish."
  },
  {
    question: "Kan microcement bruges i vådrum?",
    answer:
      "I relevante rum vurderer vi vådrumskrav, fald og afløb, så løsningen planlægges korrekt fra start."
  },
  {
    question: "Hvordan vedligeholder man microcement?",
    answer:
      "Vedligehold afhænger af overfladebehandling og brug. Vi gennemgår anbefalet rengøring og drift ved tilbuddet."
  }
];

export const metadata = buildMetadata({
  title: "Microcement på Sjælland | Gulv, bad & køkken | BP Slib",
  description:
    "Microcement på Sjælland til gulv, badeværelse og køkken. Vurdering af underlag, opbygning og vedligehold - book uforpligtende tilbudstid.",
  path: "/microcement-sjaelland"
});

export default function MicrocementSjaellandPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Microcement på Sjælland
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Microcement giver et roligt, moderne udtryk og færre fuger - og kan bruges i flere rum,
          når opbygning og underlag er korrekt. Vi hjælper med microcement på Sjælland og starter
          altid med en vurdering af underlag, slidkrav og (hvis relevant) vådrum/afløb.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Uforpligtende tilbudstid: Du får en konkret vurdering, et tilbud og en realistisk tidsplan.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tilbudstid">Book tilbudstid</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/kontakt">Kontakt</Link>
          </Button>
        </div>
      </section>

      <ReferenceStrip />

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Anvendelser</h2>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
          <li>Gulv</li>
          <li>Bad</li>
          <li>Køkken</li>
        </ul>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Prisfaktorer</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Underlagets tilstand og nødvendigt forarbejde</li>
            <li>Areal, geometri og detaljer i rummet</li>
            <li>Krav til opbygning, slidstyrke og overfladebehandling</li>
            <li>Eventuelle vådrumshensyn, afløb og overgangsløsninger</li>
          </ul>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Proces</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>1. Gennemgang af underlag, brugskrav og ønsket udtryk.</li>
            <li>2. Forslag til opbygning og konkret tilbud med realistisk tidsplan.</li>
            <li>3. Udførelse med fokus på robust overflade og drift i hverdagen.</li>
          </ol>
        </article>
      </section>

      <FaqSection
        title="FAQ om microcement"
        intro="Svar på de vigtigste spørgsmål før tilbudstid."
        items={faqItems}
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}

