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
  },
  {
    question: "Kan I fjerne skjolder omkring vasken?",
    answer:
      "Ofte ja. Det afhænger af hvor dybt de sidder, og hvilken behandling bordpladen har fået tidligere. Vi vurderer det ud fra billeder i godt lys."
  },
  {
    question: "Hvad hvis bordpladen er meget ujævn eller ru?",
    answer:
      "En ru overflade kan ofte udjævnes med den rigtige slibeproces, men det afhænger af opbygning og tilstand. Vi vurderer omfanget før vi planlægger tid."
  },
  {
    question: "Skal hele bordpladen slibes, hvis problemet kun er ét sted?",
    answer:
      "Ofte ja, hvis du vil undgå synlige overgange og få et ensartet udtryk. Vi anbefaler altid den løsning, der giver det pæneste helhedsresultat."
  },
  {
    question: "Kan jeg få en vurdering uden besøg først?",
    answer:
      "Ja. Start med prisberegneren og send 3–6 billeder (inkl. kanten/enden hvis du er i tvivl om materiale), så vender vi tilbage med næste skridt."
  },
  {
    question: "Hvordan undgår jeg at bordpladen hurtigt bliver mat igen?",
    answer:
      "Det handler især om korrekt finish og vedligehold. Du får konkrete råd ved aflevering, så du ved hvad du skal gøre – og hvad du bør undgå."
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
    <CityServicePage category="bordplade">
      <PageHero
        withImageHero
        heroBackgroundImage="/media/featured%3Agulv/feature.2.jpeg"
        eyebrow="By-side"
        title="Bordpladeslibning i Roskilde – kun massiv træ"
        intro="Vi hjælper i Roskilde med slibning, genopfriskning og finish af massiv træbordplader. Du får et enkelt forløb, klare anbefalinger og gennemsigtig pris."
      />

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Bordpladeslibning i Roskilde – når træet stadig er godt, men overfladen er træt
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          I Roskilde møder vi ofte bordplader, hvor træet i sig selv er sundt, men hvor overfladen
          har taget imod mange års hverdag: små ridser, pletter og matte zoner, der gør bordpladen
          ujævn i udtrykket. Når bordpladen er massiv træ, kan slibning og ny behandling ofte
          bringe den tilbage til et ensartet og mere “rent” look — uden at du behøver udskifte
          bordpladen.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi starter altid med at vurdere opbygning og skadetyper, så du får en realistisk
          forventning til både resultat og forløb.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Fokus på ensartethed: samme farveoplevelse og glød på hele fladen</li>
          <li>Finish vælges ud fra brug og vedligehold (ikke “one size fits all”)</li>
          <li>Klar plan for tørretid og hvornår bordpladen kan bruges igen</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          De mest almindelige skader vi ser i Roskilde-køkkener
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Nogle skader er kosmetiske, andre fortæller at finishen er slidt væk. Her er de klassiske
          tegn på at bordpladen trænger til en slibning og ny behandling:
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>
            Skjolder og ringe omkring vasken, hvor vand har arbejdet sig ind i overfladen
          </li>
          <li>Matte felter i arbejdszoner, hvor finishen ikke længere beskytter</li>
          <li>Fine ridser der gør overfladen “støvet” eller grå i lyset</li>
          <li>
            Varmepletter/brændemærker som kan være synlige selv efter rengøring
          </li>
          <li>
            Overflader der føles ru eller ujævne, fordi træet har rejst sig i brug
          </li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Kan den slibes? Hurtig afklaring på materiale
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Før vi planlægger en opgave, skal vi være sikre på at bordpladen er massiv træ. Ved finér
          kan toplaget være så tyndt, at slibning ikke er forsvarligt, hvis skaderne sidder dybt.
          Et billede af kanten eller enden (endetræ) sammen med et billede af de værste områder er
          ofte nok til at give et hurtigt svar.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Guide:{" "}
          <Link href="/bordpladeslibning/kan-det-slibes" className="font-semibold text-primary">
            /bordpladeslibning/kan-det-slibes
          </Link>
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Pris og vurdering i Roskilde – mest præcist via billeder
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Prisen afhænger af bordpladens mål, tilstand og finishvalg. Den hurtigste vej til et
          konkret svar er at sende billeder, så vi kan vurdere både helheden og problemzonerne. Når
          vi kan se bordpladen i godt lys, kan vi typisk give en mere præcis vurdering og anbefale
          den rigtige finish.
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
          Praktisk forløb: sådan gør vi det let for dig
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi planlægger forløbet, så du ved hvad der sker, og hvornår du kan bruge bordpladen igen.
          Vi afdækker omkring arbejdsområdet, arbejder trinvis og afslutter med en tydelig
          gennemgang, så du har styr på både brug og vedligehold bagefter.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Afdækning og beskyttelse af flader tæt på bordpladen</li>
          <li>Tydelig forventningsafstemning om tid og tørretid</li>
          <li>Aflevering med konkrete råd, så finishen holder pæn længere</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Vi dækker Roskilde og nærområder</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi dækker Roskilde og planlægger efter område og opgavens omfang, så tiderne bliver
          stabile.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <li>Hedehusene</li>
          <li>Trekroner</li>
          <li>Viby Sjælland</li>
          <li>Tune</li>
          <li>Køge</li>
          <li>Lejre</li>
        </ul>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
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

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Mini-case fra Roskilde</h2>
        <div className="mt-4 city-surface city-surface--panel rounded-[24px] p-5 text-sm text-muted-foreground md:p-6">
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
          Roskilde, Trekroner, Svogerslev, Veddelev, Viby Sjælland, Gadstrup, Jyllinge, Lejre (nært).
        </p>
      </section>

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
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

      <section className="city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
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

      <FaqSection items={faqItems} intro="Kort FAQ om bordpladeslibning i Roskilde." />

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </CityServicePage>
  );
}
