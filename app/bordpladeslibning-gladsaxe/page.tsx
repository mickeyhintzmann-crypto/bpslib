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
    question: "Kører I i hele Gladsaxe?",
    answer:
      "Ja, vi dækker hele Gladsaxe og planlægger ruter, så du får en stabil tid."
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
    question: "Kan I gøre bordpladen mere “nem” at holde pæn?",
    answer:
      "Ja, ofte afhænger det af finishvalget og de rigtige vedligeholdsrutiner. Vi rådgiver ud fra brug, så du vælger en løsning der passer til din hverdag."
  },
  {
    question: "Hvad hvis der er dybe ridser?",
    answer:
      "Dybe ridser kan ofte reduceres, og nogle kan fjernes, afhængigt af hvor dybt de sidder og om bordpladen er massiv træ. Vi vurderer det ud fra billeder."
  },
  {
    question: "Skal bordpladen være helt tør før behandling?",
    answer:
      "Ja, overfladen skal være klar. Hvis der er områder med fugtproblemer eller skade omkring vask, afklarer vi det først, så løsningen bliver holdbar."
  },
  {
    question: "Kan I tage opgaven uden at fjerne bordpladen?",
    answer:
      "Ofte ja. Det afhænger af adgang og opbygning. Vi afklarer det, når vi har set billeder og praktiske forhold."
  },
  {
    question: "Kan I hjælpe hvis jeg ikke ved om det er massiv træ eller finér?",
    answer:
      "Ja. Send et billede af kanten/enden (endetræ) — det er ofte nok til at afklare materialet."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Bordpladeslibning i Gladsaxe",
  description:
    "Bordpladeslibning i massiv træ i Gladsaxe med fokus på finish, prisgennemsigtighed og hurtig responstid.",
  url: "https://bpslib.dk/bordpladeslibning-gladsaxe"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning i Gladsaxe",
    item: "https://bpslib.dk/bordpladeslibning-gladsaxe"
  }
]);

export const metadata = buildMetadata({
  title: "Bordpladeslibning i Gladsaxe (massiv træ)",
  description:
    "Bordpladeslibning i Gladsaxe – kun massiv træ. Få pris via billeder, book tid eller se akutte tider.",
  path: "/bordpladeslibning-gladsaxe"
});

export default function BordpladeGladsaxePage() {
  return (
    <CityServicePage category="bordplade">
      <PageHero
        withImageHero
        heroBackgroundImage="/media/featured%3Agulv/feature.2.jpeg"
        eyebrow="By-side"
        title="Bordpladeslibning i Gladsaxe – kun massiv træ"
        intro="Vi hjælper i Gladsaxe med slibning, genopfriskning og finish af massiv træbordplader. Du får et enkelt forløb, klare anbefalinger og gennemsigtig pris."
      />

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="city-bordplade-story-heading text-2xl font-semibold text-foreground">
          Bordpladeslibning i Gladsaxe – fokus på finish, kanter og detaljer
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          I Gladsaxe møder vi ofte bordplader, hvor selve træet er i fin stand, men hvor overfladen
          er blevet ujævn i udtrykket: små ridser, matte felter og pletter, der gør at bordpladen
          ser “plettet” ud i lyset. Når bordpladen er massiv træ, kan en trinvis slibning og ny
          behandling typisk genskabe et roligt, ensartet udtryk — også når man står tæt på og ser
          kanter og samlinger.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi lægger vægt på detaljer som overgang ved væg, udskæringer og kanter, fordi det ofte er
          her helhedsindtrykket afgøres.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Ensartet udtryk i dagslys (overfladen skal “læse” ens)</li>
          <li>Fokus på kanter og udskæringer – der hvor man ser arbejdet tydeligst</li>
          <li>Rådgivning om finish ud fra brug og ønsket vedligehold</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="city-bordplade-issues-heading text-2xl font-semibold text-foreground">
          Typiske opgaver vi udfører i Gladsaxe
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          De fleste kontakter os, når bordpladen er svær at holde pæn – eller når de vil skifte til
          en finish, der passer bedre til hverdagen.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Genopfriskning af bordplader der er blevet matte og “tørre”</li>
          <li>Fjernelse/reduktion af skjolder omkring vask og arbejdszoner</li>
          <li>Udbedring af ridser og små hak, så overfladen bliver jævn igen</li>
          <li>Håndtering af varmepletter og misfarvninger, hvor træet er massivt</li>
          <li>Skift af finish for at få en mere praktisk overflade i et travlt køkken</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Kan den slibes? Sådan afklarer vi det hurtigt</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Det første vi afklarer, er om bordpladen er massiv træ. Ved finér kan toplaget være meget
          tyndt, og så kan slibning være risikabelt, hvis skaderne sidder dybt. Et billede af kanten
          eller enden (endetræ) sammen med et billede af skaderne er ofte nok til at give et hurtigt
          svar.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Guide:{" "}
          <Link href="/bordpladeslibning/kan-det-slibes" className="font-semibold text-primary">
            /bordpladeslibning/kan-det-slibes
          </Link>
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Pris og vurdering – mest præcist via billeder</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Prisen afhænger af bordpladens mål, skadernes dybde og hvilken finish du ønsker. Vi kan
          typisk give en langt mere præcis vurdering, når vi har set bordpladen i godt lys — både
          helheden og de værste områder.
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
          Praktisk: sådan forbereder du området (hurtigt og nemt)
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Du behøver ikke gøre det “perfekt”. Det vigtigste er fri adgang til bordpladen, så vi kan
          afdække ordentligt og arbejde effektivt. Vi aftaler på forhånd, hvordan du bedst kan bruge
          køkkenet undervejs, og hvad du kan forvente efter behandling (tørretid og brug).
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Fjern løse ting fra bordpladen og området omkring</li>
          <li>Sørg for fri adgang til udskæringer/kanter (vask/kogeplade)</li>
          <li>
            Vi fortæller dig præcist hvornår bordpladen kan bruges igen, afhængigt af finish
          </li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder omkring Gladsaxe vi ofte dækker</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi dækker Gladsaxe og nærliggende områder og planlægger ruter, så tiderne er stabile.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <li>Søborg</li>
          <li>Buddinge</li>
          <li>Bagsværd</li>
          <li>Lyngby</li>
          <li>Herlev</li>
          <li>Gentofte</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Lokal indsigt i Gladsaxe</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          I Gladsaxe møder vi ofte rækkehuse og villaer med solide køkkenbordplader, hvor adgang og
          parkering kan variere fra kvarter til kvarter. Vi tilpasser tidsplanen, så arbejdet
          bliver effektivt og roligt, og vi beskytter gulve og flader omkring bordpladen. Hvis du er
          i tvivl om materialet, starter vi med{" "}
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
          <Link href="/bordpladeslibning-koebenhavn-omegn" className="font-semibold text-primary">
            København & omegn
          </Link>{" "}
          for et bredere overblik.
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Mini-case fra Gladsaxe</h2>
        <div className="mt-4 city-surface city-surface--panel rounded-[24px] p-5 text-sm text-muted-foreground md:p-6">
          <ul className="grid gap-2">
            <li>
              <span className="font-semibold text-foreground">Problem:</span> Bordplade med dybe
              ridser og matte områder omkring vasken.
            </li>
            <li>
              <span className="font-semibold text-foreground">Løsning:</span> Trinvis slibning og ny
              oliebehandling med fokus på jævn finish.
            </li>
            <li>
              <span className="font-semibold text-foreground">Resultat:</span> Ensartet overflade og
              bedre modstandsdygtighed i daglig brug.
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
          Søborg, Bagsværd, Mørkhøj, Buddinge, Stengård, Høje Gladsaxe.
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

      <FaqSection items={faqItems} intro="Kort FAQ om bordpladeslibning i Gladsaxe." />

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </CityServicePage>
  );
}
