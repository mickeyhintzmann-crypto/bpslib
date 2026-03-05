import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { PageHero } from "@/components/bordplade/PageHero";
import {
  StructuredData,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import { CityServicePage } from "@/components/layouts/CityServicePage";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Kører I i hele København?",
    answer:
      "Ja, vi dækker hele København og planlægger ruter, så du får en stabil tid."
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
    question: "Kan I hjælpe, hvis bordpladen ser pæn ud ét sted men plettet et andet?",
    answer:
      "Ja. Det er meget almindeligt. Målet er at få et ensartet udtryk, og derfor vurderer vi ofte hele bordpladen samlet, så du undgår synlige overgange."
  },
  {
    question: "Hvor mange billeder skal jeg sende?",
    answer:
      "3–6 billeder er typisk nok: helhed, nærbilleder i godt lys og et billede af kanten/enden hvis du er i tvivl om materialet."
  },
  {
    question: "Kan I slibe tæt på væg og fuge?",
    answer:
      "Ofte ja, men det afhænger af bordpladens montering og adgang. Vi vurderer det ud fra billeder og afklarer det før vi går i gang."
  },
  {
    question: "Hvilken finish er bedst til et travlt køkken?",
    answer:
      "Det afhænger af dine prioriteter. Nogle vil have minimalt vedligehold, andre prioriterer et naturligt udtryk. Vi rådgiver ud fra brug, så du vælger praktisk."
  },
  {
    question: "Kan I tage flere bordplader på samme dag?",
    answer:
      "Ja, ofte kan vi planlægge køkken + fx bryggers/spisebord sammen, hvis du nævner det på forhånd og sender billeder/mål."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Bordpladeslibning i København",
  description:
    "Bordpladeslibning i massiv træ i København med fokus på finish, prisgennemsigtighed og hurtig responstid.",
  url: "https://bpslib.dk/bordpladeslibning-koebenhavn"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning i København",
    item: "https://bpslib.dk/bordpladeslibning-koebenhavn"
  }
]);

export const metadata = buildMetadata({
  title: "Bordpladeslibning i København (massiv træ)",
  description:
    "Bordpladeslibning i København – kun massiv træ. Få pris via billeder, book tid eller se akutte tider.",
  path: "/bordpladeslibning-koebenhavn"
});

export default function BordpladeKoebenhavnPage() {
  return (
    <CityServicePage category="bordplade">
      <PageHero
        withImageHero
        eyebrow="By-side"
        title="Bordpladeslibning i København – kun massiv træ"
        intro="Vi hjælper i København med slibning, genopfriskning og finish af massiv træbordplader. Du får et enkelt forløb, klare anbefalinger og gennemsigtig pris."
      />

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Bordpladeslibning i København – når køkkenbordet skal være pænt i dagslys
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          I København ser vi ofte bordplader, hvor brugsspor bliver ekstra tydelige, fordi køkkener
          tit har store vinduespartier og meget dagslys. Små ridser og matte zoner kan få en ellers
          flot massiv træbordplade til at se “ujævn” ud, især omkring vask og på arbejdsfladerne.
          Med korrekt slibning og en finish, der passer til brugen, kan bordpladen ofte få et mere
          roligt, ensartet udtryk igen — uden at du skal udskifte hele bordet eller hele
          køkkenbordet.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>
            Ensartet udtryk i lys: vi arbejder for en overflade der “læser” ens fra alle vinkler
          </li>
          <li>Finishvalg efter hverdagsbrug (vand, varme, madlavning og rengøring)</li>
          <li>Tydelig forventningsafstemning om tid, tørretid og brug bagefter</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Typiske københavner-problemer: vaskezonen, varme og “grå” overflader
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Når overfladen mister sin beskyttelse, kommer problemerne ofte i de samme zoner. Vi
          hjælper typisk med:
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>
            Skjolder og ringe tæt på vasken, hvor vand og sæbe har slidt finishen ned
          </li>
          <li>Varmepletter fra gryder/pander og små brændemærker på træets top</li>
          <li>Fine ridser, der gør bordpladen mat og “grå” i lyset</li>
          <li>Overflader der føles ru eller ujævne efter mange års brug</li>
          <li>
            Bordplader der er svære at rengøre, fordi finishen er slidt og porøs
          </li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Materialet først: massiv træ eller finér?</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Det vigtigste spørgsmål før vi planlægger slibning, er opbygningen. Massive træbordplader
          kan ofte slibes flere gange over levetiden, mens finér kan have et meget tyndt toplag. Et
          billede af kanten eller enden (endetræ) er ofte nok til at afklare det hurtigt.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Guide:{" "}
          <Link href="/bordpladeslibning/kan-det-slibes" className="font-semibold text-primary">
            /bordpladeslibning/kan-det-slibes
          </Link>
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Pris i København – få den mest præcist via billeder</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Prisen afhænger af mål, skader og finishvalg. I København er den hurtigste proces næsten
          altid at starte med en billedvurdering: så kan vi vurdere opbygning, arbejdsomfang og
          næste skridt uden at spilde tid. Når vi har set bordpladen i godt lys, kan vi give en
          langt mere præcis vurdering.
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

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Praktisk plan i København: adgang, tid og en pæn aflevering
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi gør det så let som muligt at få arbejdet udført i en travl hverdag. Derfor afklarer vi
          tidligt adgang, praktiske forhold og hvordan køkkenet kan fungere undervejs. Vi afdækker
          omkring arbejdsområdet og afslutter med en tydelig gennemgang, så du ved præcis hvordan du
          bruger og vedligeholder overfladen bagefter.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Afdækning og beskyttelse af området omkring bordpladen</li>
          <li>Klar plan for tørretid og hvornår bordpladen kan bruges igen</li>
          <li>Råd til vedligehold, så finishen holder pæn længere</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Vi dækker København og bydele med kort planlægning
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi dækker København og planlægger tider ud fra område og opgavens omfang, så forløbet
          bliver stabilt.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <li>Nørrebro</li>
          <li>Vesterbro</li>
          <li>Østerbro</li>
          <li>Amager</li>
          <li>Valby</li>
          <li>Vanløse</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Lokal indsigt i København</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Mange af vores opgaver i København er køkkenbordplader i lejligheder, hvor adgang og
          parkering skal planlægges smart. Vi tilpasser tidspunktet, så der er ro omkring opgangen,
          og vi beskytter gulve og områder omkring bordpladen. Hvis du er i tvivl om materialet,
          starter vi med{" "}
          <Link href="/bordpladeslibning/prisberegner" className="font-semibold text-primary">
            prisberegneren
          </Link>{" "}
          og hjælper dig hurtigt videre.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Du kan også se vores{" "}
          <Link href="/bordpladeslibning-koebenhavn-omegn" className="font-semibold text-primary">
            København & omegn
          </Link>{" "}
          region-hub eller hele{" "}
          <Link href="/bordpladeslibning-sjaelland" className="font-semibold text-primary">
            Sjælland
          </Link>{" "}
          hvis du vil have et bredere overblik.
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Mini-case fra København</h2>
        <div className="mt-4 city-surface city-surface--panel rounded-[24px] p-5 text-sm text-muted-foreground md:p-6">
          <ul className="grid gap-2">
            <li>
              <span className="font-semibold text-foreground">Problem:</span> Mat og ridset eg-bordplade
              med varmepletter i en københavnerlejlighed.
            </li>
            <li>
              <span className="font-semibold text-foreground">Løsning:</span> Skånsom slibning, lokal
              udbedring og rådgivning om finish.
            </li>
            <li>
              <span className="font-semibold text-foreground">Resultat:</span> Ensartet overflade og
              klar farve, klar til brug samme dag.
            </li>
          </ul>
        </div>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
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

      <section className="city-grid-cards grid gap-6 md:grid-cols-2">
        <article className="city-surface city-surface--panel rounded-[28px] p-6">
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
        <article className="city-surface city-surface--panel rounded-[28px] p-6">
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

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder vi dækker</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Vi dækker blandt andet følgende områder og planlægger ruter for at holde tiden skarp:
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Indre By, Østerbro, Nørrebro, Vesterbro, Valby, Vanløse, Brønshøj, Amagerbro, Sydhavn,
          Nordhavn, Christianshavn.
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
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

      <FaqSection items={faqItems} intro="Kort FAQ om bordpladeslibning i København." />

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </CityServicePage>
  );
}
