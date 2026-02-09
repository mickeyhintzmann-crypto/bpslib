import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { PageHero } from "@/components/bordplade/PageHero";
import {
  StructuredData,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Kører I i hele Hillerød?",
    answer:
      "Ja, vi dækker hele Hillerød og planlægger ruter, så du får en stabil tid."
  },
  {
    question: "Kan alle bordplader slibes?",
    answer:
      "Vi sliber kun massive træbordplader. Er du i tvivl, så upload et kant- eller endebillede."
  },
  {
    question: "Olie eller lak - hvad anbefaler I?",
    answer:
      "Valget afhænger af brug og udtryk. Vi rådgiver altid om den finish der passer bedst."
  },
  {
    question: "Hvor lang tid tager det?",
    answer:
      "De fleste opgaver klares i 1-3 slots afhængigt af størrelse og tilstand."
  },
  {
    question: "Hvad koster det typisk?",
    answer:
      "Prisen afhænger af mål, tilstand og finish. Se prisguiden eller få et konkret estimat via billeder."
  },
  {
    question: "Hvordan får jeg et hurtigt estimat?",
    answer:
      "Brug prisberegneren og upload 3-6 billeder, herunder kant eller ende hvis du er i tvivl."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Bordpladeslibning i Hillerød",
  description:
    "Bordpladeslibning i massiv træ i Hillerød med fokus på finish, prisgennemsigtighed og hurtig responstid.",
  url: "https://bpslib.dk/bordpladeslibning-hilleroed"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning i Hillerød",
    item: "https://bpslib.dk/bordpladeslibning-hilleroed"
  }
]);

export const metadata = buildMetadata({
  title: "Bordpladeslibning i Hillerød (massiv træ)",
  description:
    "Bordpladeslibning i Hillerød – kun massiv træ. Få pris via billeder, book tid eller se akutte tider.",
  path: "/bordpladeslibning-hilleroed"
});

export default function BordpladeHilleroedPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <PageHero
        eyebrow="By-side"
        title="Bordpladeslibning i Hillerød – kun massiv træ"
        intro="Vi hjælper i Hillerød med slibning, genopfriskning og finish af massiv træbordplader. Du får et enkelt forløb, klare anbefalinger og gennemsigtig pris."
      />

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Lokal indsigt i Hillerød</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          I Hillerød møder vi ofte huse og rækkehuse med køkkenbordplader, der er slidte efter
          daglig brug. Adgang og parkering kan variere fra kvarter til kvarter, så vi planlægger
          tidspunktet, så arbejdet bliver roligt og effektivt. Vi beskytter gulve og flader omkring
          bordpladen, og hvis du er i tvivl om materialet, starter vi med{" "}
          <Link href="/bordpladeslibning/prisberegner" className="font-semibold text-primary">
            prisberegneren
          </Link>{" "}
          og hjælper dig hurtigt videre.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Du kan også se{" "}
          <Link href="/bordpladeslibning-nordsjaelland" className="font-semibold text-primary">
            Nordsjælland
          </Link>{" "}
          eller hele{" "}
          <Link href="/bordpladeslibning-sjaelland" className="font-semibold text-primary">
            Sjælland
          </Link>{" "}
          for et bredere overblik.
        </p>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">Mini-case fra Hillerød</h2>
        <div className="mt-4 rounded-2xl border border-border/70 bg-white/70 p-5 text-sm text-muted-foreground">
          <ul className="grid gap-2">
            <li>
              <span className="font-semibold text-foreground">Problem:</span> Bordplade med
              ridser og matte felter efter daglig brug.
            </li>
            <li>
              <span className="font-semibold text-foreground">Løsning:</span> Trinvis slibning og ny
              oliebehandling med fokus på jævn finish.
            </li>
            <li>
              <span className="font-semibold text-foreground">Resultat:</span> Ensartet overflade og
              bedre modstandsdygtighed i køkkenet.
            </li>
          </ul>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">Hvad vi hjælper med</h2>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <li>
            Fjern{" "}
            <Link href="/bordpladeslibning/skjolder" className="font-semibold text-primary">
              skjolder
            </Link>{" "}
            og pletter uden at gå på kompromis med træets udtryk.
          </li>
          <li>
            Udbedr{" "}
            <Link href="/bordpladeslibning/ridser" className="font-semibold text-primary">
              ridser
            </Link>{" "}
            og mærker så overfladen føles ens igen.
          </li>
          <li>
            Håndtering af{" "}
            <Link href="/bordpladeslibning/braendemaerker" className="font-semibold text-primary">
              brændemærker
            </Link>{" "}
            og varmepletter i massiv træ.
          </li>
          <li>Genopfriskning af slidte og matte bordplader.</li>
        </ul>
      </section>

      <section className="grid gap-6 py-10 md:grid-cols-2 md:py-14">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Pris og tid</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Prisen afhænger af størrelse, tilstand og finish. En mindre bordplade klares typisk i 1
            slot, mens større opgaver kan kræve 2 eller 3 slots. Se vores{" "}
            <Link href="/bordpladeslibning/pris" className="font-semibold text-primary">
              prisguide
            </Link>{" "}
            for eksempler.
          </p>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Kun massiv træ</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Vi sliber kun massive træbordplader. Er du i tvivl, så upload et kant- eller endebillede
            i{" "}
            <Link href="/bordpladeslibning/prisberegner" className="font-semibold text-primary">
              prisberegneren
            </Link>{" "}
            – så afklarer vi det hurtigt.
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder vi dækker</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Vi dækker blandt andet følgende områder og planlægger ruter for at holde tiden skarp:
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Hillerød, Ny Hammersholt, Ullerød, Gørløse, Allerød (nært), Fredensborg (nært), Lynge (nært).
        </p>
      </section>

      <section className="py-10 md:py-14">
        <p className="text-sm text-muted-foreground">
          Overvej også{" "}
          <Link href="/bordpladeslibning/olie-eller-lak" className="font-semibold text-primary">
            olie eller lak
          </Link>{" "}
          som finishvalg, eller book tid direkte via{" "}
          <Link href="/bordpladeslibning/book" className="font-semibold text-primary">
            booking
          </Link>{" "}
          hvis du allerede kender omfanget. Akutte tider kan ses på{" "}
          <Link href="/akutte-tider" className="font-semibold text-primary">
            akutte tider
          </Link>
          .
        </p>
      </section>

      <FaqSection items={faqItems} intro="Kort FAQ om bordpladeslibning i Hillerød." />

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </main>
  );
}
