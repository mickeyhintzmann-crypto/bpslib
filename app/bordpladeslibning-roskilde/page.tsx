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
    question: "Kører I i hele Roskilde?",
    answer:
      "Ja, vi dækker hele Roskilde og planlægger ruter, så du får en stabil tid."
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
    question: "Hvor hurtigt kan jeg få en vurdering i Roskilde?",
    answer:
      "Den hurtigste vej er at sende 3–6 billeder (inkl. et billede af kanten/enden hvis du er i tvivl om materialet). Så kan vi typisk vurdere omfang og næste skridt hurtigt."
  },
  {
    question: "Skal hele bordpladen slibes, hvis der kun er én skade?",
    answer:
      "Ofte ja, hvis man vil undgå synlige overgange og få et ensartet udtryk. I nogle tilfælde kan lokale skader håndteres som del af en samlet slibning og ny finish."
  },
  {
    question: "Hvad kan jeg gøre for at undgå nye skjolder bagefter?",
    answer:
      "Det handler især om den rigtige finish og gode rutiner. Vi anbefaler altid en behandling, der passer til brugen (fx vand/varme), og du får konkrete råd til vedligehold ved aflevering."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Bordpladeslibning i Roskilde",
  description:
    "Bordpladeslibning i massiv træ i Roskilde med fokus på finish, prisgennemsigtighed og hurtig responstid.",
  url: "https://bpslib.dk/bordpladeslibning-roskilde"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning i Roskilde",
    item: "https://bpslib.dk/bordpladeslibning-roskilde"
  }
]);

export const metadata = buildMetadata({
  title: "Bordpladeslibning i Roskilde (massiv træ)",
  description:
    "Bordpladeslibning i Roskilde – kun massiv træ. Få pris via billeder, book tid eller se akutte tider.",
  path: "/bordpladeslibning-roskilde"
});

export default function BordpladeRoskildePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <PageHero
        eyebrow="By-side"
        title="Bordpladeslibning i Roskilde – kun massiv træ"
        intro="Vi hjælper i Roskilde med slibning, genopfriskning og finish af massiv træbordplader. Du får et enkelt forløb, klare anbefalinger og gennemsigtig pris."
      />

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Lokal indsigt i Roskilde</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          I Roskilde møder vi ofte huse og rækkehuse med køkkenbordplader, der er slidte efter
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
          <Link href="/bordpladeslibning-midtsjaelland" className="font-semibold text-primary">
            Midtsjælland
          </Link>{" "}
          eller hele{" "}
          <Link href="/bordpladeslibning-sjaelland" className="font-semibold text-primary">
            Sjælland
          </Link>{" "}
          for et bredere overblik.
        </p>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">Mini-case fra Roskilde</h2>
        <div className="mt-4 rounded-2xl border border-border/70 bg-white/70 p-5 text-sm text-muted-foreground">
          <ul className="grid gap-2">
            <li>
              <span className="font-semibold text-foreground">Problem:</span> Bordplade med
              skjolder og matte felter omkring vasken.
            </li>
            <li>
              <span className="font-semibold text-foreground">Løsning:</span> Trinvis slibning og ny
              oliebehandling med fokus på jævn finish.
            </li>
            <li>
              <span className="font-semibold text-foreground">Resultat:</span> Ensartet overflade og
              forbedret modstandsdygtighed i køkkenet.
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
          Roskilde, Trekroner, Svogerslev, Veddelev, Viby Sjælland, Gadstrup, Jyllinge, Lejre (nært).
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Lokal indsigt: bordplader i Roskilde</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          I Roskilde ser vi ofte bordplader, der er blevet “trætte” af helt almindelig daglig brug: matte felter ved vask og komfur, små ridser fra køkkenarbejde og skjolder efter vand og varme. Når bordpladen er massiv træ, kan den i mange tilfælde bringes tilbage til et ensartet udtryk med korrekt slibning og en finish, der passer til brugen.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Vi starter altid med at vurdere materiale og skadetyper, så du ved, hvad der realistisk kan reddes — og hvad der kræver en anden løsning.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Typiske udfordringer: skjolder, matte zoner, ridser og varmepletter</li>
          <li>Vi vurderer altid dybde og nuværende behandling før vi anbefaler finish</li>
          <li>Målet er en overflade der føles ens og ser ens ud i lys</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Praktisk forløb i Roskilde: rolig plan og pæn aflevering</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          For at forløbet bliver let for dig, afklarer vi de praktiske rammer tidligt: adgang, parkering og om bordpladen behandles på stedet. Vi beskytter området omkring bordpladen, arbejder struktureret og afslutter med en tydelig gennemgang, så du ved hvordan overfladen skal bruges og vedligeholdes bagefter.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Afdækning af gulve og flader omkring arbejdsområdet</li>
          <li>Klar forventningsafstemning om tid, tørretid og brug efter behandling</li>
          <li>Rådgivning om olie vs. lak ud fra dit køkkens brug og din hverdag</li>
        </ul>
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

      <FaqSection items={faqItems} intro="Kort FAQ om bordpladeslibning i Roskilde." />

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </main>
  );
}
