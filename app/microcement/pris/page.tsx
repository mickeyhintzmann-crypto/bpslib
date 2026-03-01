import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Kan microcement lægges ovenpå fliser?",
    answer:
      "Ofte ja, men det afhænger af flisernes stand, fuger og underlagets stabilitet. Vi vurderer det ud fra billeder og evt. besigtigelse."
  },
  {
    question: "Er microcement dyrere i badeværelse?",
    answer:
      "Det kan være det, fordi der ofte er flere detaljer, vandzoner og krav til opbygning og beskyttelse. Det vurderes fra opgave til opgave."
  },
  {
    question: "Hvor lang tid tager et microcement-forløb typisk?",
    answer:
      "Det afhænger af opbygning og tørretider mellem lag. Vi giver altid en realistisk plan baseret på din opgave."
  },
  {
    question: "Hvad er den typiske årsag til merpris?",
    answer:
      "Underlag der kræver ekstra forarbejde (ujævnheder, revner, bevægelse) og rum med mange afbrydelser og detaljer."
  },
  {
    question: "Hvordan vedligeholder man microcement?",
    answer:
      "Vedligehold afhænger af den valgte finish/forsegling og rummets brug. Du får konkrete råd ved aflevering."
  }
];

export const metadata = buildMetadata({
  title: "Pris på microcement | BPSLIB",
  description:
    "Få overblik over hvad der påvirker prisen på microcement: underlag, opbygning, detaljer og finish. Send billeder og få en konkret vurdering.",
  path: "/microcement/pris"
});

export default function MicrocementPrisPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Pris på microcement
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen på microcement handler sjældent kun om antal m². Den afhænger især af underlag,
          opbygning og hvor mange detaljer rummet har.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          På denne side får du et klart overblik over de vigtigste prisfaktorer — og hvordan du får
          en konkret pris baseret på din opgave.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvad påvirker prisen mest?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Microcement er et håndværk med flere lag, og det er forarbejdet der afgør både udseende
          og holdbarhed. To rum kan have samme størrelse, men ende med meget forskellig pris, hvis
          underlaget kræver ekstra opbygning, eller hvis der er mange kanter, nicher og detaljer.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>Underlagets stand: revner, bevægelse, ujævnheder og tidligere belægninger</li>
          <li>Opbygning og lag: hvad der kræves for at få en stærk og stabil overflade</li>
          <li>Detaljeniveau: hjørner, kanter, nicher, søjler, trapper eller mange afbrydelser</li>
          <li>Rummets krav: fx ekstra belastning, vandzoner eller særlige driftskrav</li>
          <li>Overfladebehandling: finish og beskyttelse der passer til brugen</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Hvorfor kan microcement variere så meget i pris?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Microcement ser “simpelt” ud, men resultatet kommer af en kontrolleret opbygning og den
          rigtige afslutning. Når prisen varierer, skyldes det typisk ikke materialet alene — men
          tiden på forberedelse, lag og de praktiske forhold i rummet. Jo bedre underlag og jo
          færre afbrydelser, jo mere effektivt kan forløbet planlægges.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>Godt underlag = mindre forarbejde</li>
          <li>Færre detaljer = hurtigere udførelse</li>
          <li>Realistisk tørretid = bedre slutfinish</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Vejledende prisniveau</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi giver gerne et vejledende prisniveau, men vi fastsætter den endelige pris ud fra
          underlaget og opbygningen. Derfor beder vi typisk om billeder og en kort beskrivelse først
          — det gør prisvurderingen mere præcis og minimerer overraskelser.
        </p>
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground md:text-base">
          <span className="font-semibold text-foreground">Tip:</span> Send både nærbilleder af
          underlaget og et helhedsbillede af rummet. Det gør det markant lettere at vurdere
          opbygning og detaljeniveau.
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sådan får du en konkret pris (hurtigst muligt)</h2>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>1. Send kort beskrivelse af opgaven + 3–6 billeder</li>
          <li>2. Vi afklarer underlag, brug og ønsket udtryk</li>
          <li>3. Du får et konkret forslag til løsning, forløb og pris</li>
          <li>4. Vi planlægger udførelse ud fra adgang og tørretider</li>
        </ol>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Hvad skal du sende for at vi kan vurdere prisen?
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>Billeder af underlaget (tæt på) + et helhedsbillede</li>
          <li>Ca. m² eller mål (cirka er fint)</li>
          <li>Om det er væg, gulv, bad eller køkken</li>
          <li>Adresse/by + ønsket tidsperiode</li>
          <li>Hvis der er særlige forhold (afløb, fald, mange hjørner), så nævn det kort</li>
        </ul>
      </section>

      <FaqSection
        items={faqItems}
        title="Ofte stillede spørgsmål"
        intro="Svar på de vigtigste spørgsmål om pris, underlag og forløb ved microcement."
      />

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Se også</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>
            <Link href="/microcement-sjaelland" className="font-medium text-foreground hover:text-primary">
              Microcement på Sjælland
            </Link>
          </li>
          <li>
            <Link href="/cases" className="font-medium text-foreground hover:text-primary">
              Se cases
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Vil du have en pris baseret på din opgave?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Send billeder og en kort beskrivelse, så vender vi tilbage med et konkret forslag til
          opbygning, tidsplan og pris.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tilbudstid">Book tilbudstid</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/microcement-sjaelland">Se microcement</Link>
          </Button>
        </div>
      </section>

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
