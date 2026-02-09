import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvad bestemmer prisen på gulvafslibning?",
    answer:
      "Gulvtype, areal, tilstand, antal rum og ønsket efterbehandling er de vigtigste faktorer."
  },
  {
    question: "Er afhøvling dyrere end slibning?",
    answer:
      "Afhøvling kræver mere arbejde og bruges ved dybe skader eller store niveauforskelle, så prisen er ofte højere."
  },
  {
    question: "Kan jeg få en pris uden besigtigelse?",
    answer:
      "Vi giver et uforpligtende tilbud ud fra din beskrivelse og supplerer med spørgsmål hvis nødvendigt."
  },
  {
    question: "Hvad er typisk inkluderet?",
    answer:
      "Slibning, aftalt efterbehandling og oprydning. Ekstra reparationer aftales separat."
  },
  {
    question: "Hvordan booker jeg en tilbudstid?",
    answer:
      "Du kan booke uforpligtende tilbudstid her på siden, så kontakter vi dig med en vurdering."
  },
  {
    question: "Kører I på hele Sjælland?",
    answer: "Ja, vi dækker hele Sjælland og planlægger opgaver efter område og tilgængelighed."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning pris | Hvad bestemmer prisen?",
  description:
    "Få overblik over prisfaktorer ved gulvafslibning. Book uforpligtende tilbudstid eller kontakt os for en vurdering.",
  path: "/gulvafslibning/pris"
});

export default function GulvPrisPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Pris på gulvafslibning
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen afhænger af gulvtype, areal, tilstand og ønsket behandling. Vi giver et uforpligtende
          tilbud baseret på opgavens omfang, så du får et realistisk overblik før du beslutter dig.
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

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Prisfaktorer</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Gulvtype og opbygning (planker, parket, sildeben)</li>
            <li>Slid, ridser, pletter og eventuelle ujævnheder</li>
            <li>Antal rum og mængden af slibning</li>
            <li>Efterbehandling: lak, olie eller sæbe</li>
            <li>Ekstra arbejde som reparationer eller afhøvling</li>
          </ul>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Eksempler på opgavetyper</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>• Enkelt rum med almindeligt slid og afsluttende lak/olie.</p>
            <p>• Flere rum hvor gulvet skal slibes ensartet og behandles samlet.</p>
            <p>• Dybere skader eller niveau-forskelle som kræver ekstra forarbejde.</p>
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Inkluderet i tilbuddet</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Typisk inkluderet</p>
            <ul className="mt-2 space-y-2">
              <li>Slibning efter aftalt plan</li>
              <li>Valgt efterbehandling</li>
              <li>Oprydning efter arbejdet</li>
            </ul>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Aftales separat</p>
            <ul className="mt-2 space-y-2">
              <li>Større reparationer af undergulv</li>
              <li>Afhøvling ved store ujævnheder</li>
              <li>Ekstra arbejde uden for aftalt omfang</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Relaterede sider</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Læs om processen på{" "}
          <Link href="/gulvafslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            gulvafslibning på Sjælland
          </Link>
          , og se muligheder for finish som{" "}
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
          . Har du skader? Se hjælp til{" "}
          <Link href="/gulvafslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser og pletter
          </Link>
          .
        </p>
      </section>

      <FaqSection
        items={faqItems}
        title="FAQ om pris på gulvafslibning"
        intro="Svarene her giver et hurtigt overblik før du booker tilbudstid."
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
