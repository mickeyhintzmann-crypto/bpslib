import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { PageHero } from "@/components/bordplade/PageHero";
import {
  StructuredData,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { CityServicePage } from "@/components/layouts/CityServicePage";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Kører I i hele København og omegn?",
    answer:
      "Ja, vi dækker København og omegn og planlægger ruter, så du får en stabil tid."
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
    question: "Skal jeg rydde hele køkkenet før I kommer?",
    answer:
      "Nej, men vi beder typisk om fri adgang til bordpladen og at de ting, du bruger dagligt, er flyttet væk fra arbejdsområdet. Så kan vi afdække ordentligt og arbejde effektivt."
  },
  {
    question: "Kan I slibe rundt om vask og kogeplade?",
    answer:
      "Ofte ja. Det afhænger af udskæringer, adgang og bordpladens opbygning. Vi vurderer det ud fra billeder og afklarer det før vi planlægger tiden."
  },
  {
    question: "Hvor hurtigt kan jeg bruge bordpladen igen?",
    answer:
      "Det afhænger af valg af finish og tørretid. Vi giver dig altid en klar forventning, så du kan planlægge madlavning og brug af køkkenet."
  },
  {
    question: "Kan jeg få en vurdering uden at booke først?",
    answer:
      "Ja. Start med prisberegneren og upload 3–6 billeder (inkl. kant/ende hvis du er i tvivl om materialet), så vender vi tilbage med næste skridt."
  },
  {
    question: "Kan I tage flere bordplader i samme besøg?",
    answer:
      "Ja, ofte kan vi planlægge køkken + fx bryggers/spisebord samlet, hvis du nævner det på forhånd og sender billeder/mål."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Bordpladeslibning i København og omegn",
  description:
    "Bordpladeslibning i massiv træ i København og omegn med fokus på finish, prisgennemsigtighed og hurtig responstid.",
  url: "https://bpslib.dk/bordpladeslibning-koebenhavn-omegn"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning i København og omegn",
    item: "https://bpslib.dk/bordpladeslibning-koebenhavn-omegn"
  }
]);

export const metadata = buildMetadata({
  title: "Bordpladeslibning i København & omegn (massiv træ)",
  description:
    "Bordpladeslibning i København og omegn – kun massiv træ. Få pris via billeder, book tid eller se akutte tider.",
  path: "/bordpladeslibning-koebenhavn-omegn"
});

export default function BordpladeKoebenhavnPage() {
  return (
    <CityServicePage category="bordplade">
      <PageHero
        withImageHero
        heroBackgroundImage="/media/galleries%3Abordplade%3Asingles%3Ahero/singles%3Ahero_6.jpeg"
        eyebrow="Region-hub"
        title="Bordpladeslibning i København & omegn – kun massiv træ"
        intro="Vi hjælper private og mindre erhverv i København og omegn med slibning, genopfriskning og finish af massiv træbordplader. Du får et enkelt forløb, klare anbefalinger og gennemsigtig pris."
      />

      <section className="city-surface city-surface--panel rounded-[24px] p-5 text-sm text-muted-foreground md:p-6">
        <p>
          <Link href="/bordpladeslibning-sjaelland" className="font-semibold text-primary">
            bordpladeslibning på Sjælland
          </Link>
          , eller gå direkte til{" "}
          <Link href="/bordpladeslibning/prisberegner" className="font-semibold text-primary">
            prisberegneren
          </Link>{" "}
          hvis du vil have en hurtig vurdering.
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Lokal indsigt i København & omegn</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          I København & omegn ser vi mange bordplader, der er blevet slidte på de samme områder: rundt om vasken, foran komfuret og på de flader, der bruges mest i hverdagen. I stedet for at udskifte en ellers god massiv træbordplade, kan slibning og en korrekt finish ofte give et markant løft — både visuelt og praktisk.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Når opgaven ligger i omegnskommunerne, handler et godt forløb typisk om planlægning: adgang, parkering og en tidsplan, der passer til en travl hverdag.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Vi vurderer altid trætype, skader og eksisterende behandling før vi anbefaler løsning</li>
          <li>Fokus på ensartet udtryk i lys: ingen “lapper” eller synlige overgange</li>
          <li>Rådgivning om finish ud fra brug (madlavning, vand, varme og slid)</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Mini-case fra København & omegn</h2>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p><span className="font-semibold text-foreground">Problem:</span> Tørre, matte zoner ved vask og fine ridser på en massiv bordplade i en familiebolig.</p>
          <p><span className="font-semibold text-foreground">Løsning:</span> Trinvis slibning, let udjævning af overfladen og ny behandling med fokus på drift og vedligehold.</p>
          <p><span className="font-semibold text-foreground">Resultat:</span> Mere roligt udtryk, ensartet overflade og en finish der er nemmere at holde pæn i daglig brug.</p>
        </div>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvad vi typisk hjælper med i omegnsområdet</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          De fleste opgaver er en kombination af flere ting. Her er de mest almindelige grunde til, at kunder kontakter os:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Genopfriskning af bordplader der føles ru, matte eller “udtørrede”</li>
          <li>Fjernelse af vand-/varmeaftryk og pletter, hvor overfladen ikke længere beskytter</li>
          <li>Udbedring af ridser og mærker, så bordpladen igen føles jævn</li>
          <li>Reduktion af brændemærker/varmepletter, når træet er massivt og skaden kan slibes ned</li>
          <li>Ny finish for at skifte udtryk eller gøre bordpladen mere praktisk i hverdagen</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Pris, tid og planlægning</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Prisen afhænger af mål, tilstand og hvilken finish du vælger bagefter. Mange bordplader kan planlægges i et enkelt besøg, mens større eller mere slidte overflader kan kræve flere slots. Det vigtigste er, at vi afklarer omfang og forventninger før vi låser tid — så du ved, hvad du siger ja til.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Se priseksempler på <Link href="/bordpladeslibning/pris" className="font-semibold text-primary">/bordpladeslibning/pris</Link>, eller få en konkret vurdering via <Link href="/bordpladeslibning/prisberegner" className="font-semibold text-primary">/bordpladeslibning/prisberegner</Link>.
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Kun massiv træ — sådan undgår du at spilde tid</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Vi sliber kun massive træbordplader. Hvis bordpladen er finér eller laminat, kan slibning være risikabelt eller umuligt. Den hurtigste afklaring er et billede af kanten eller enden (endetræ). Så kan vi ofte sige med det samme, om bordpladen er egnet.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Se også: <Link href="/bordpladeslibning/kan-det-slibes" className="font-semibold text-primary">/bordpladeslibning/kan-det-slibes</Link>
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder vi dækker i København & omegn</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          “København & omegn” dækker typisk kommuner og områder lige omkring byen. Vi planlægger ruter, så tiderne er stabile og du får et roligt forløb.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Frederiksberg, Gentofte, Lyngby, Gladsaxe, Rødovre, Hvidovre, Ballerup, Greve, Ishøj.</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Det hjælper vi med</h2>
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

      <ProcessSteps />

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
        <h2 className="text-2xl font-semibold text-foreground">Serviceområder i København og omegn</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Vi dækker blandt andet disse områder og planlægger ruter for at holde tiden skarp:
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          København, Frederiksberg, Vanløse, Valby, Østerbro, Nørrebro, Vesterbro, Amager, Hvidovre,
          Rødovre, Gentofte, Lyngby.
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

      <FaqSection
        items={faqItems}
        intro="Kort FAQ om bordpladeslibning i København og omegn."
      />

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </CityServicePage>
  );
}
