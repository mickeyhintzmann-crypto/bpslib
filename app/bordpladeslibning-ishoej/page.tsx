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
    question: "Kører I i hele Ishøj?",
    answer:
      "Ja, vi dækker hele Ishøj og planlægger ruter, så du får en stabil tid."
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
    question: "Kan I vurdere min bordplade ud fra billeder?",
    answer:
      "Ja. Send 3–6 billeder (inkl. et billede af kanten/enden hvis du er i tvivl om materialet), så kan vi typisk vurdere muligheder og næste skridt hurtigt."
  },
  {
    question: "Skal jeg vælge olie eller lak på forhånd?",
    answer:
      "Nej. Du kan skrive “i tvivl”, så rådgiver vi ud fra brug, forventet vedligehold og hvilket udtryk du ønsker."
  },
  {
    question: "Hvad hvis der er varmepletter?",
    answer:
      "Varmepletter kan ofte reduceres, og nogle gange fjernes, hvis bordpladen er massiv træ og skaden ikke sidder for dybt. Vi vurderer det ud fra billeder."
  },
  {
    question: "Kan I tage køkkenbord og fx bryggers i samme omgang?",
    answer:
      "Ja. Nævn det i beskrivelsen og send billeder/mål på begge, så planlægger vi forløbet samlet."
  },
  {
    question: "Hvordan undgår jeg nye skjolder efter behandling?",
    answer:
      "Det handler om korrekt finish og gode rutiner. Du får konkrete vedligeholdsråd ved aflevering, så overfladen holder længere."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Bordpladeslibning i Ishøj",
  description:
    "Bordpladeslibning i massiv træ i Ishøj med fokus på finish, prisgennemsigtighed og hurtig responstid.",
  url: "https://bpslib.dk/bordpladeslibning-ishoej"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning i Ishøj",
    item: "https://bpslib.dk/bordpladeslibning-ishoej"
  }
]);

export const metadata = buildMetadata({
  title: "Bordpladeslibning i Ishøj (massiv træ)",
  description:
    "Bordpladeslibning i Ishøj – kun massiv træ. Få pris via billeder, book tid eller se akutte tider.",
  path: "/bordpladeslibning-ishoej"
});

export default function BordpladeIshoejPage() {
  return (
    <CityServicePage category="bordplade">
      <PageHero
        withImageHero
        heroBackgroundImage="/media/featured%3Agulv/feature.2.jpeg"
        eyebrow="By-side"
        title="Bordpladeslibning i Ishøj – kun massiv træ"
        intro="Vi hjælper i Ishøj med slibning, genopfriskning og finish af massiv træbordplader. Du får et enkelt forløb, klare anbefalinger og gennemsigtig pris."
      />

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Bordpladeslibning i Ishøj – når overfladen skal være ens igen
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Ishøj-opgaver handler ofte om helt klassisk køkkenslid: pletter der “bider sig fast”, små
          ridser fra daglig brug og områder hvor bordpladen ikke længere afviser vand som den skal.
          Hvis bordpladen er massiv træ, kan slibning og ny finish typisk give et markant løft uden
          at udskifte hele bordpladen.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi vurderer altid først materialet og skadens dybde, så du får et realistisk billede af,
          hvad der kan opnås.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Ensartet udtryk i lys (ingen skjolder der “lever videre” i finishen)</li>
          <li>
            Valg af finish ud fra brug: meget madlavning, vand og varme kræver tydelige valg
          </li>
          <li>
            Klar plan for tid og brug bagefter (tørretid og hvornår du kan bruge bordpladen igen)
          </li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Typiske problemer vi ser – og hvordan de håndteres
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Mange problemer ser værre ud end de er, men de kræver den rigtige tilgang. Vi arbejder
          trinvis, så vi ikke sliber mere end nødvendigt, og så overfladen bliver jævn og klar til
          behandling.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">Liste (med korte forklaringer):</p>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">Skjolder og pletter:</span> ofte fra
            vand/varme eller tidligere rengøringsmidler
          </li>
          <li>
            <span className="font-semibold text-foreground">Ridser og “ru” områder:</span> typisk
            ved arbejdszoner og der hvor man skærer og flytter ting
          </li>
          <li>
            <span className="font-semibold text-foreground">Matte felter:</span> tegn på at
            overfladen er slidt og ikke længere beskytter
          </li>
          <li>
            <span className="font-semibold text-foreground">Varmepletter/brændemærker:</span> kan
            nogle gange reduceres eller fjernes, hvis træet er massivt
          </li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Praktisk i en travl hverdag: sådan planlægger vi i Ishøj
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi planlægger forløbet, så det passer ind i en normal hverdag. Det betyder, at vi tidligt
          afklarer adgang, arbejdsområde og hvordan køkkenet kan bruges undervejs. Du får en
          tydelig forventning om, hvad du skal forberede — og hvad du ikke behøver bekymre dig om.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Afdækning omkring bordpladen og beskyttelse af nærliggende flader</li>
          <li>Tydelig forventningsafstemning om tidsforløb og tørretid</li>
          <li>Aflevering med råd til vedligehold, så finishen holder pæn længere</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Pris og vurdering via billeder (hurtigste vej)</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Prisen afhænger af bordpladens mål, tilstand og hvilken finish du ønsker. Den hurtigste
          vurdering får du ved at sende billeder — så kan vi typisk afklare både muligheder og næste
          skridt uden unødige frem og tilbage.
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
        <h2 className="text-2xl font-semibold text-foreground">Massiv træ – sådan tjekker du det hurtigt</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi sliber kun massive træbordplader. Hvis du er i tvivl, så send et billede af kanten
          eller enden af bordpladen (endetræ). Det er ofte nok til at afklare, om slibning er
          muligt og sikker.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Guide:{" "}
          <Link href="/bordpladeslibning/kan-det-slibes" className="font-semibold text-primary">
            /bordpladeslibning/kan-det-slibes
          </Link>
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder tæt på Ishøj vi ofte kører i</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi dækker Ishøj og nærliggende områder og planlægger ruter, så tiderne bliver stabile.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <li>Vallensbæk</li>
          <li>Brøndby Strand</li>
          <li>Hvidovre</li>
          <li>Greve</li>
          <li>Taastrup</li>
          <li>Albertslund</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Lokal indsigt i Ishøj</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          I Ishøj møder vi ofte rækkehuse og villaer med køkkenbordplader, der er slidte efter
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
          eller{" "}
          <Link href="/bordpladeslibning-vest-sydsjaelland" className="font-semibold text-primary">
            Vest- & Sydsjælland
          </Link>{" "}
          for et bredere overblik.
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Mini-case fra Ishøj</h2>
        <div className="mt-4 city-surface city-surface--panel rounded-[24px] p-5 text-sm text-muted-foreground md:p-6">
          <ul className="grid gap-2">
            <li>
              <span className="font-semibold text-foreground">Problem:</span> Bordplade med matte
              felter og skjolder omkring vasken.
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
          Ishøj, Ishøj Strand, Tranegilde, Vallensbæk (nært), Brøndby Strand (nært), Greve (nært),
          Hvidovre (nært).
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

      <FaqSection items={faqItems} intro="Kort FAQ om bordpladeslibning i Ishøj." />

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </CityServicePage>
  );
}
