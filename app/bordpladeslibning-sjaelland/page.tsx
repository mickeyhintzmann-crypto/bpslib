import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { InternalLinkGrid } from "@/components/bordplade/InternalLinkGrid";
import { PageHero } from "@/components/bordplade/PageHero";
import { ServiceAreaGrid } from "@/components/bordplade/ServiceAreaGrid";
import {
  StructuredData,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvad koster bordpladeslibning på Sjælland?",
    answer:
      "Prisen afhænger af mål, tilstand og finish. Upload billeder for et præcist estimat på din opgave."
  },
  {
    question: "Arbejder I kun med massiv træ?",
    answer:
      "Ja, vi sliber kun massiv træbordplader. Er du i tvivl, så upload et kantbillede til hurtig afklaring."
  },
  {
    question: "Kan I fjerne skjolder og ridser?",
    answer:
      "I de fleste tilfælde ja. Vi vurderer dybde og skadetype før vi anbefaler behandling og finish."
  },
  {
    question: "Tilbyder I akutte tider?",
    answer:
      "Ja, vi har akutte tider med fast pris inden for 14 dage, når kalenderen tillader det."
  },
  {
    question: "Hvor lang tid tager en opgave?",
    answer:
      "Mange opgaver kan gennemføres samme dag. Tørretid afhænger af valgt behandling."
  },
  {
    question: "Hvilken finish skal jeg vælge?",
    answer:
      "Vi rådgiver mellem olie og lak ud fra brug, udtryk og ønsket vedligehold."
  },
  {
    question: "Dækker I hele Sjælland?",
    answer:
      "Ja, vi kører i hele regionen og planlægger ruter for stabile tider og korte svartider."
  },
  {
    question: "Hvordan får jeg hurtigst en pris?",
    answer:
      "Upload 3–6 billeder, mål og et kantfoto i prisberegneren. Så kan vi vurdere opgaven hurtigt."
  },
  {
    question: "Skal jeg booke med det samme?",
    answer:
      "Du kan enten starte med prisberegneren eller booke direkte, hvis du allerede kender omfanget."
  },
  {
    question: "Kan I slibe en bordplade med udskæring til vask og kogeplade?",
    answer:
      "Ofte ja. Udskæringer og kanter kræver bare at vi afklarer adgang og opbygning på forhånd, så vi planlægger det korrekt."
  },
  {
    question: "Kan I fjerne skjolder helt?",
    answer:
      "Mange skjolder kan fjernes eller reduceres markant, men resultatet afhænger af dybde, trætype og tidligere behandling. Vi vurderer det ud fra billeder."
  },
  {
    question: "Hvor lang tid tager det?",
    answer:
      "Det afhænger af bordpladens størrelse, skader og valg af finish/tørretid. Vi giver en realistisk plan, når vi har set opgaven."
  },
  {
    question: "Skal bordpladen afmonteres?",
    answer:
      "Ikke altid. Det afhænger af opgaven og praktiske forhold. Vi afklarer det, når vi vurderer bordpladen."
  },
  {
    question: "Hvilken finish er mest praktisk i et køkken?",
    answer:
      "Det afhænger af brug og vedligehold. Lak er ofte nem i drift, mens olie kan give et varmt udtryk men kræver mere løbende pleje. Vi rådgiver ud fra din hverdag."
  },
  {
    question: "Kan I hjælpe hvis jeg ikke ved om den er massiv træ?",
    answer:
      "Ja. Send et billede af kanten/enden (endetræ), så kan vi ofte afklare det hurtigt."
  },
  {
    question: "Hvordan får jeg den hurtigste prisvurdering?",
    answer:
      "Brug prisberegneren og upload 3–6 billeder (helhed, nærbilleder og kant/ende). Så kan vi typisk vurdere opgaven hurtigt og præcist."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Bordpladeslibning på Sjælland",
  description:
    "Bordpladeslibning i massiv træ på Sjælland med fokus på prisgennemsigtighed, finish og hurtig responstid.",
  url: "https://bpslib.dk/bordpladeslibning-sjaelland"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning på Sjælland",
    item: "https://bpslib.dk/bordpladeslibning-sjaelland"
  }
]);

export const metadata = buildMetadata({
  title: "Bordpladeslibning på Sjælland",
  description:
    "Bordpladeslibning i massiv træ på hele Sjælland. Få pris via billeder, book tid eller se akutte tider.",
  path: "/bordpladeslibning-sjaelland"
});

export default function BordpladePillarPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <PageHero
        eyebrow="Pillar-side"
        title="Bordpladeslibning på Sjælland"
        intro="Vi hjælper med slibning, genopbygning og finish af massiv træbordplader. Du får tydelig rådgivning, realistiske priser og et forløb der er let at forstå fra første kontakt."
        showAkutteTider
      />

      <ProcessSteps />

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">
          Bordpladeafslibning på Sjælland – når du vil bevare det du allerede har
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          En massiv træbordplade kan ofte have mange gode år tilbage, selvom den ser slidt ud.
          Formålet med bordpladeslibning er at genskabe en ensartet overflade og vælge en
          behandling, der passer til din hverdag. Det er især relevant, hvis du har pletter,
          ridser, matte zoner eller varmeaftryk, men stadig har en bordplade i massiv træ.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Genskaber et roligt udtryk ved at udjævne overfladen trinvis</li>
          <li>Gør bordpladen mere praktisk ved at vælge den rigtige finish til brugen</li>
          <li>Kan være et stærkt alternativ til udskiftning, hvis materialet er egnet</li>
        </ul>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">Hvad vi typisk hjælper med</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Bordplader slides forskelligt alt efter brug og tidligere behandling. Her er de mest
          almindelige årsager til at kunder kontakter os:
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Skjolder og ringe fra vand, varme og daglig brug</li>
          <li>Ridser og mærker der gør overfladen ujævn i lys</li>
          <li>Matte felter og “tørre” zoner, hvor finishen er slidt væk</li>
          <li>Varmepletter og små brændemærker (afhænger af dybde og trætype)</li>
          <li>
            Bordplader der er svære at holde pæne, fordi overfladen er porøs eller ujævn
          </li>
        </ul>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">Massiv træ eller finér? Det afklarer alt</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi arbejder med massive træbordplader. Hvis bordpladen er finér eller laminat, kan klassisk
          slibning være begrænset eller risikabel. Derfor starter vi altid med at afklare opbygningen
          — ofte kan et billede af kanten eller enden (endetræ) give svaret med det samme.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Læs guiden:{" "}
          <Link href="/bordpladeslibning/kan-det-slibes" className="font-semibold text-primary">
            /bordpladeslibning/kan-det-slibes
          </Link>
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sådan foregår bordpladeslibning (kort og realistisk)</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi arbejder struktureret og trinvis, så vi ikke fjerner mere materiale end nødvendigt.
          Målet er en overflade der føles ens og ser ens ud, og som er klar til den finish du
          vælger.
        </p>
        <ol className="mt-4 grid gap-2 text-sm text-muted-foreground">
          <li>1. Materiale og tilstand afklares (ofte via billeder)</li>
          <li>
            2. Overfladen slibes trinvis ud fra skader og eksisterende behandling
          </li>
          <li>3. Kanter og udskæringer gennemgås, så helhedsindtrykket bliver pænt</li>
          <li>
            4. Finish påføres ud fra brug og ønsket vedligehold (olie/lak m.m.)
          </li>
          <li>5. Aflevering med råd til brug, tørretid og vedligehold</li>
        </ol>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">Pris: få et konkret svar uden at gætte</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Prisen afhænger af mål, skader og finishvalg. Den hurtigste vej til en præcis vurdering
          er at starte med billeder, så vi kan se både helheden og de værste områder. På den måde
          kan vi anbefale den rigtige løsning og undgå overraskelser.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Se priseksempler:{" "}
          <Link href="/bordpladeslibning/pris" className="font-semibold text-primary">
            /bordpladeslibning/pris
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          Få vurdering via billeder:{" "}
          <Link href="/bordpladeslibning/prisberegner" className="font-semibold text-primary">
            /bordpladeslibning/prisberegner
          </Link>
        </p>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">Olie eller lak – hvad betyder det for dig?</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Valg af finish handler om både udtryk og drift. Nogle ønsker et mere naturligt look og
          accepterer løbende pleje, mens andre vil have en overflade der kræver mindst muligt i
          hverdagen. Vi rådgiver ud fra hvordan bordpladen bruges, så finishvalget passer til din
          hverdag.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Olie kan give et varmt udtryk og kræver typisk mere løbende vedligehold</li>
          <li>Lak kan være mere lukket/robust og ofte nemmere i daglig drift</li>
          <li>
            Det bedste valg afhænger af brug, forventninger og hvor “perfekt” du vil holde
            overfladen
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Derfor vælger mange bordpladeslibning fremfor udskiftning
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Hvis bordpladen er massiv træ og ellers er stabil, kan slibning være en effektiv måde at
          løfte køkkenet på uden at starte forfra. Du bevarer materialet, får en ny overflade og kan
          vælge en finish der passer bedre til din brug i dag end den oprindelige gjorde.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Du bevarer træets udtryk og kvalitet</li>
          <li>Du kan ændre finish og vedligeholdsniveau</li>
          <li>Du får et synligt resultat uden at udskifte hele bordpladen</li>
        </ul>
      </section>

      <section className="grid gap-6 py-10 md:grid-cols-2 md:py-14">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Prisfaktorer og forventninger</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Prisen påvirkes af mål, tilstand, finish og eventuelt ekstra klargøring. Vi har samlet
            en tung prisguide med eksempler og slot-anbefaling.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/bordpladeslibning/pris">Se prisguiden</Link>
            </Button>
            <Button asChild>
              <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
            </Button>
          </div>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Finish og typiske problemer</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Vi hjælper med valg mellem olie og lak, og vi håndterer ofte skjolder, ridser og
            slidt/mat overflade som en del af samme opgave. Vi kan udføre sæbebehandling, men
            anbefaler normalt olie eller lak til bordplader.
          </p>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <Link href="/bordpladeslibning/olie-eller-lak" className="hover:text-foreground">
              Olie eller lak: hvad passer til dit køkken?
            </Link>
            <Link href="/bordpladeslibning/skjolder" className="hover:text-foreground">
              Fjern skjolder på bordpladen
            </Link>
            <Link href="/bordpladeslibning/slidt-mat-overflade" className="hover:text-foreground">
              Slidt eller mat bordplade
            </Link>
            <Link href="/bordpladeslibning/ridser" className="hover:text-foreground">
              Fjern ridser i bordpladen
            </Link>
          </div>
        </article>
      </section>

      <ServiceAreaGrid />

      <InternalLinkGrid
        title="Genveje til næste skridt"
        intro="Disse links dækker pris, booking, materialeafklaring og relaterede problem-sider."
        links={[
          { href: "/bordpladeslibning/pris", label: "Prisguide" },
          { href: "/bordpladeslibning/kan-det-slibes", label: "Kan det slibes?" },
          { href: "/bordpladeslibning/olie-eller-lak", label: "Olie eller lak" },
          { href: "/bordpladeslibning/skjolder", label: "Skjolder" },
          { href: "/bordpladeslibning/slidt-mat-overflade", label: "Slidt/mat overflade" },
          { href: "/bordpladeslibning/ridser", label: "Ridser" },
          { href: "/bordpladeslibning/prisberegner", label: "Få pris via billeder" },
          { href: "/bordpladeslibning/book", label: "Book tid" },
          { href: "/akutte-tider", label: "Akutte tider" }
        ]}
      />

      <FaqSection
        items={faqItems}
        intro="Spørgsmålene her samler det vigtigste om materiale, pris, forløb og serviceområde."
      />

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </main>
  );
}
