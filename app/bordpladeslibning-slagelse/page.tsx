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
    question: "Kører I i hele Slagelse?",
    answer:
      "Ja, vi dækker hele Slagelse og planlægger ruter, så du får en stabil tid."
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
  },
  {
    question: "Kan I fjerne både ridser og skjolder i samme omgang?",
    answer:
      "Ofte ja. Slibningen udjævner overfladen og kan fjerne eller reducere flere typer brugsspor, men resultatet afhænger af skadernes dybde og tidligere behandling."
  },
  {
    question: "Hvad hvis jeg er i tvivl om bordpladen er massiv træ?",
    answer:
      "Send et billede af kanten/enden (endetræ). Det er ofte nok til at afklare opbygningen hurtigt."
  },
  {
    question: "Skal jeg vælge finish nu?",
    answer:
      "Nej. Du kan skrive “i tvivl”, så rådgiver vi ud fra brug og ønsket vedligehold, før vi lægger os fast."
  },
  {
    question: "Kan jeg få en vurdering uden at I kommer ud først?",
    answer:
      "Ja. Start med prisberegneren og send billeder/mål, så vender vi tilbage med næste skridt."
  },
  {
    question: "Hvordan passer jeg bedst på bordpladen bagefter?",
    answer:
      "Det afhænger af finish. Du får konkrete råd ved aflevering, så du ved præcis hvad du skal gøre (og hvad du bør undgå)."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Bordpladeslibning i Slagelse",
  description:
    "Bordpladeslibning i massiv træ i Slagelse med fokus på finish, prisgennemsigtighed og hurtig responstid.",
  url: "https://bpslib.dk/bordpladeslibning-slagelse"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning i Slagelse",
    item: "https://bpslib.dk/bordpladeslibning-slagelse"
  }
]);

export const metadata = buildMetadata({
  title: "Bordpladeslibning i Slagelse (massiv træ)",
  description:
    "Bordpladeslibning i Slagelse – kun massiv træ. Få pris via billeder, book tid eller se akutte tider.",
  path: "/bordpladeslibning-slagelse"
});

export default function BordpladeSlagelsePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <PageHero
        eyebrow="By-side"
        title="Bordpladeslibning i Slagelse – kun massiv træ"
        intro="Vi hjælper i Slagelse med slibning, genopfriskning og finish af massiv træbordplader. Du får et enkelt forløb, klare anbefalinger og gennemsigtig pris."
      />

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">
          Bordpladeslibning i Slagelse – når køkkenet skal føles “nyt” igen
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          I Slagelse hjælper vi ofte kunder, hvor bordpladen egentlig er sund nok, men overfladen er
          blevet trist: den føles ru, ser mat ud og har pletter eller ridser der gør hele køkkenet
          mindre pænt. Hvis bordpladen er massiv træ, kan en korrekt slibning og ny finish typisk
          genskabe et ensartet udtryk og gøre bordpladen mere praktisk i drift.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi starter altid med at afklare opbygning og skadetyper, så du får et realistisk billede
          af mulighederne — før vi planlægger tid.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>
            Fokus på ensartet overflade, så lyset ikke afslører “skygger” og skjolder
          </li>
          <li>Rådgivning om finish ud fra brug (madlavning, vand, varme og slid)</li>
          <li>Klar plan for tørretid og hvornår bordpladen kan bruges igen</li>
        </ul>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">
          Det vi oftest bliver kontaktet om i Slagelse
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          De fleste opgaver handler om at fjerne synlige brugsspor og skabe en overflade, der er
          behagelig at arbejde på igen.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Skjolder ved vasken og matte zoner i arbejdsområdet</li>
          <li>Fine ridser, der gør overfladen “grå” i lys</li>
          <li>Varmepletter fra gryder/pander og små brændemærker</li>
          <li>Bordplader der føles tørre og ujævne efter mange års brug</li>
          <li>
            Ønske om ny behandling fordi bordpladen er svær at holde pæn som den er nu
          </li>
        </ul>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">
          Sådan vurderer vi om din bordplade kan slibes
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Det vigtigste er materialet. Massive træbordplader kan ofte slibes, mens finér kan være
          begrænset. Den hurtigste afklaring er et billede af kanten eller enden af bordpladen
          (endetræ) sammen med et billede af skaderne. Så kan vi typisk sige hurtigt, om slibning
          er realistisk — og hvilken løsning der passer bedst.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Guide:{" "}
          <Link href="/bordpladeslibning/kan-det-slibes" className="font-semibold text-primary">
            /bordpladeslibning/kan-det-slibes
          </Link>
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Pris og tilbud i Slagelse – hurtigst via billeder</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Prisen afhænger af mål, tilstand og finish. Vi kan give et langt mere præcist svar, når
          vi har set bordpladen i godt lys. Derfor anbefaler vi at starte med billeder — så sparer
          du tid, og du får et konkret forslag til næste skridt.
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
        <h2 className="text-2xl font-semibold text-foreground">Praktisk forløb: hvad du kan forvente</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi gør forløbet så enkelt som muligt. Du får at vide, hvad der skal være ryddet, hvordan
          vi beskytter området, og hvad du kan forvente undervejs. Ved aflevering gennemgår vi
          finish og giver konkrete råd til vedligehold, så resultatet holder pænt længere.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Afdækning og beskyttelse omkring arbejdsområdet</li>
          <li>Tydelig forventningsafstemning om tid og tørretid</li>
          <li>Aflevering med vedligeholdsråd der passer til din finish</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder omkring Slagelse vi ofte dækker</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi dækker Slagelse og nærliggende byer/områder og planlægger ruter, så tiderne er stabile.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <li>Korsør</li>
          <li>Skælskør</li>
          <li>Sorø</li>
          <li>Dianalund</li>
          <li>Kalundborg</li>
          <li>Holbæk</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Lokal indsigt i Slagelse</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          I Slagelse møder vi ofte huse og rækkehuse med køkkenbordplader, der er slidte efter
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
          <Link href="/bordpladeslibning-vest-sydsjaelland" className="font-semibold text-primary">
            Vest- & Sydsjælland
          </Link>{" "}
          eller hele{" "}
          <Link href="/bordpladeslibning-sjaelland" className="font-semibold text-primary">
            Sjælland
          </Link>{" "}
          for et bredere overblik.
        </p>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">Mini-case fra Slagelse</h2>
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
          Slagelse, Korsør, Skælskør, Sorø (nært), Dianalund (nært), Fuglebjerg (nært), Dalmose.
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

      <FaqSection items={faqItems} intro="Kort FAQ om bordpladeslibning i Slagelse." />

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </main>
  );
}
