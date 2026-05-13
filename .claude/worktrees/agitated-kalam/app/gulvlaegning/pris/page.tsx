import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvad er typisk den største prisdriver?",
    answer:
      "Underlaget og forberedelsen. Planhed, fugt og behov for opretning kan påvirke både tid og pris mere end selve gulvtypen."
  },
  {
    question: "Kan I lægge gulv i flere rum i etaper?",
    answer:
      "Ja. Vi kan planlægge rækkefølge og etaper, så det passer med adgang og hverdagen i boligen."
  },
  {
    question: "Skal det gamle gulv altid fjernes?",
    answer:
      "Ikke altid. Det afhænger af type, opbygning og hvad der er under. Vi vurderer det ud fra billeder og opgavebeskrivelse."
  },
  {
    question: "Hvor lang tid tager gulvlægning typisk?",
    answer:
      "Det afhænger af m², underlag og antal afslutninger. Vi giver altid en realistisk plan, når vi kender opgaven."
  },
  {
    question: "Hjælper I med lister og afslutninger?",
    answer:
      "Ja. Afslutninger er en vigtig del af helhedsindtrykket, og vi planlægger dem som en del af opgaven."
  }
];

export const metadata = buildMetadata({
  title: "Pris på gulvlægning | BPSLIB",
  description:
    "Overblik over hvad der påvirker prisen på gulvlægning: gulvtype, underlag, afslutninger og forberedelse. Send billeder og få en konkret vurdering.",
  path: "/gulvlaegning/pris"
});

export default function GulvlaegningPrisPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Pris på gulvlægning
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen på gulvlægning afhænger ikke kun af gulvtypen, men i høj grad af underlaget og
          afslutningerne.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Her får du et klart overblik over de vigtigste prisfaktorer — og hvordan du får en konkret
          vurdering baseret på din bolig og dit ønskede resultat.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvad bestemmer prisen på gulvlægning?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Et gulv kan se enkelt ud på tegningen, men i praksis er det detaljer og forberedelse, der
          afgør både kvalitet og pris. Vi vurderer altid opgaven ud fra helheden, så du får et gulv
          der ligger stabilt, ser pænt ud og fungerer i hverdagen.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>Gulvtype og opbygning: fx træ, laminat eller vinyl – og hvordan det skal lægges</li>
          <li>Underlagets stand: planhed, fugt og om der kræves ekstra forberedelse</li>
          <li>Rummets geometri: mange hjørner, nicher, dørtrin og overgange</li>
          <li>Afslutninger: lister, overgangsprofiler og samlinger ved køkken/entré</li>
          <li>Nedtagning/bortskaffelse: hvis eksisterende gulv skal fjernes først</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Underlaget er ofte den største forskel</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Når gulve bliver “utilfredsstillende”, skyldes det sjældent selve gulvbrædderne — men at
          underlaget ikke var klar. Små ujævnheder kan give knirk, bevægelse eller synlige
          samlinger over tid. Derfor prioriterer vi at afklare underlaget tidligt, så løsningen
          bliver holdbar.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>Plant underlag = pænere samlinger og mere ro i gulvet</li>
          <li>Korrekt fugt-niveau = færre problemer på sigt</li>
          <li>God forberedelse = bedre finish og længere levetid</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Vejledende prisniveau</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi kan give et vejledende niveau, når vi kender gulvtype, m² og underlagets stand. Den
          endelige pris fastsættes ud fra forberedelsen, detaljerne og de praktiske forhold i
          boligen. Derfor beder vi typisk om få oplysninger og billeder først — det gør vurderingen
          langt mere præcis.
        </p>
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground md:text-base">
          <span className="font-semibold text-foreground">Tip:</span> Et billede af underlaget
          (hvis gulvet er fjernet) og et helhedsbillede af rummet gør det meget lettere at vurdere
          forberedelse og afslutninger.
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sådan får du en konkret pris</h2>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>
            1. Fortæl hvilken gulvtype du overvejer (eller send billeder af det du har i dag)
          </li>
          <li>2. Send ca. m² + 3–6 billeder af rummene og overgange</li>
          <li>3. Vi afklarer underlag, afslutninger og evt. nedtagning</li>
          <li>4. Du får et konkret forslag til løsning, tidsplan og pris</li>
        </ol>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Hvad skal du sende for at vi kan vurdere prisen?
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>Ca. m² eller mål (cirka er fint)</li>
          <li>Hvilken gulvtype du ønsker (eller hvad du overvejer)</li>
          <li>Billeder af rummene + dørtrin/overgange</li>
          <li>Om eksisterende gulv skal fjernes</li>
          <li>Adresse/by + ønsket tidsperiode</li>
        </ul>
      </section>

      <FaqSection
        items={faqItems}
        title="Ofte stillede spørgsmål"
        intro="Svar på de mest almindelige spørgsmål om pris, underlag og forløb ved gulvlægning."
      />

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Se også</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>
            <Link href="/gulvlaegning-sjaelland" className="font-medium text-foreground hover:text-primary">
              Gulvlægning på Sjælland
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
        <h2 className="text-2xl font-semibold text-foreground">Vil du have en pris baseret på din bolig?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Send billeder og en kort beskrivelse, så vender vi tilbage med et konkret forslag til
          gulvtype, forberedelse og næste skridt.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tilbudstid">Book tilbudstid</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/gulvlaegning-sjaelland">Se gulvlægning</Link>
          </Button>
        </div>
      </section>

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
