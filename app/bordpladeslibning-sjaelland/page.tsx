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
