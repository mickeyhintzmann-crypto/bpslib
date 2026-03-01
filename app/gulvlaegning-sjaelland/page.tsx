import Link from "next/link";

import { ReferenceStrip } from "@/components/ReferenceStrip";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvilke gulvtyper lægger I?",
    answer:
      "Vi hjælper med trægulv, laminat og vinyl og rådgiver om materialevalg ud fra slid, udtryk og budget."
  },
  {
    question: "Hvordan vurderer I underlaget før montering?",
    answer:
      "Vi vurderer planhed, fugtforhold og opbygning, så gulvet får den rigtige base og holder stabilt over tid."
  },
  {
    question: "Hvad påvirker prisen på gulvlægning?",
    answer:
      "Pris afhænger især af m², materiale, forberedelse af underlag og afslutninger som fodlister og overgange."
  },
  {
    question: "Hvor lang tid tager et typisk gulvlægningsprojekt?",
    answer:
      "Tidsplanen afhænger af areal og kompleksitet. Du får en realistisk plan efter tilbudstiden."
  },
  {
    question: "Kan I også hjælpe med afslutninger og lister?",
    answer:
      "Ja, vi kan hjælpe med fodlister, overgange og praktiske afslutninger, så resultatet fremstår færdigt."
  }
];

export const metadata = buildMetadata({
  title: "Gulvlægning på Sjælland | Trægulv, laminat & vinyl | BP Slib",
  description:
    "Gulvlægning på Sjælland: trægulv, laminat og vinyl. Rådgivning, opbygning og montering - book uforpligtende tilbudstid.",
  path: "/gulvlaegning-sjaelland"
});

export default function GulvlaegningSjaellandPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvlægning på Sjælland
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Et nyt gulv ændrer hele rummet - både udtryk, komfort og vedligehold. Vi hjælper med
          gulvlægning på Sjælland og rådgiver dig, så du ender med en løsning, der passer til dit
          hjem (eller din drift), dit budget og din hverdag.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Uforpligtende tilbudstid: Vi vurderer underlag, m², rum, materialevalg og afslutninger -
          og giver dig et konkret tilbud og en realistisk plan.
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
        <h2 className="text-2xl font-semibold text-foreground">Hvad vi hjælper med</h2>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <li>Trægulv</li>
          <li>Laminat</li>
          <li>Vinyl</li>
          <li>Underlag/forberedelse</li>
          <li>Afslutninger (fodlister/overgange)</li>
        </ul>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Sådan foregår det</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>1. Tilbudstid med gennemgang af behov, materialer og praktiske forhold.</li>
            <li>2. Klart tilbud med opbygning, materialevalg og estimeret tidsplan.</li>
            <li>3. Montering og afslutning med fokus på drift og holdbarhed i hverdagen.</li>
          </ol>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Typiske projekter</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Vi hjælper både ved udskiftning af ældre gulve og ved nyetablering i enkelte rum eller
            større boligarealer. Vi tilpasser løsning efter trafik, rengøringsbehov og ønsket udtryk.
          </p>
        </article>
      </section>

      <FaqSection
        title="FAQ om gulvlægning"
        intro="Kort overblik før du booker tilbudstid."
        items={faqItems}
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}

