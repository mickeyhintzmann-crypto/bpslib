import Link from "next/link";
import Image from "next/image";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { InternalLinkGrid } from "@/components/bordplade/InternalLinkGrid";
import { ServicePageLayout } from "@/components/layouts/ServicePageLayout";
import { BeforeAfterGrid } from "@/components/media/BeforeAfterGrid";
import { CaseGallery } from "@/components/media/CaseGallery";
import { MidPageCTA } from "@/components/marketing/MidPageCTA";
import { ProblemCards } from "@/components/marketing/ProblemCards";
import { ServiceAreaGrid } from "@/components/bordplade/ServiceAreaGrid";
import {
  StructuredData,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { Button } from "@/components/ui/button";
import { beforeAfterBordplade, galleryBordplade } from "@/lib/mediaManifest";
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
  },
  {
    question: "Er bordpladeslibning det samme som afslibning af bordplade?",
    answer:
      "Ja, det bruges ofte om det samme. Det handler om at slibe den slidte overflade ned og gøre bordpladen klar til en ny behandling."
  },
  {
    question: "Kan man slibe en køkkenbordplade med skjolder og ridser?",
    answer:
      "Ofte ja, hvis bordpladen er massiv træ. Resultatet afhænger af dybde og tidligere behandling, så vi vurderer det ud fra billeder."
  },
  {
    question: "Hvad menes der med renovering af køkkenbordplade?",
    answer:
      "Typisk slibning af bordpladen kombineret med en ny behandling (fx olie eller lak) og rådgivning om vedligehold."
  },
  {
    question: "Kan I slibe alle træbordplader?",
    answer:
      "Vi sliber kun massive træbordplader. Ved finér/laminat kan slibning være begrænset eller risikabelt. Send et billede af kanten/enden, så afklarer vi det hurtigt."
  },
  {
    question: "Hvilken behandling er mest praktisk efter slibning?",
    answer:
      "Det afhænger af brug og vedligehold. Lak er ofte nem i drift, mens olie kan give et varmt udtryk men kræver mere løbende pleje."
  },
  {
    question: "Hvordan får jeg hurtigst en vurdering?",
    answer:
      "Upload 3–6 billeder via prisberegneren (helhed + nærbilleder + kant/ende). Så kan vi typisk vurdere opgaven hurtigt og præcist."
  }
];

const problemCardsItems = [
  {
    title: "Skjolder ved vask og vandringe",
    description:
      "Når finishen er slidt, kan vand trække ind og give skjolder. Vi vurderer dybde og anbefaler en behandling der passer til din brug."
  },
  {
    title: "Ridser og ru overflade",
    description:
      "Fine ridser kan gøre bordpladen mat og ujævn i lyset. Trinvis slibning kan ofte genskabe en jævn, ensartet overflade."
  },
  {
    title: "Matte zoner i arbejdsområdet",
    description:
      "Typisk tegn på at beskyttelsen er slidt væk. Vi gør overfladen ens igen og hjælper med finishvalg."
  },
  {
    title: "Varmepletter og misfarvninger",
    description:
      "Varmeaftryk kan ofte reduceres afhængigt af trætype og dybde. Vi starter med en vurdering via billeder."
  }
];

const caseGalleryItems = [
  {
    title: "Køkkenbord – skjolder ved vask og matte zoner",
    location: "Sjælland",
    summary:
      "Typisk opgave hvor overfladen er slidt ned i arbejdszoner. Vi vurderer materiale, sliber trinvis og anbefaler finish der passer til hverdagen."
  },
  {
    title: "Træbordplade – fine ridser og ujævn glans",
    location: "København & omegn",
    summary:
      "Når lyset afslører ridser og ‘grå’ felter, er målet et roligt, ensartet udtryk og en behandling der er realistisk at vedligeholde."
  },
  {
    title: "Massiv bordplade – varmepletter og misfarvning",
    location: "Roskilde",
    summary:
      "Varmeaftryk kan ofte reduceres afhængigt af dybde og trætype. Vi starter med en billedvurdering, så forventninger og plan er klare."
  },
  {
    title: "Spisebord – samlet vurdering via billeder",
    location: "Sjælland",
    summary:
      "Spiseborde kan ofte reddes med en målrettet slibning. Du sender billeder og mål, og vi vender tilbage med et konkret forslag til næste skridt."
  }
];

const caseGalleryItemsWithImages: Array<
  (typeof caseGalleryItems)[number] & {
    image?: {
      src: string;
      alt: string;
      hoverSrc?: string;
      hoverAlt?: string;
    };
  }
> = caseGalleryItems.map((item, index) => ({
  ...item,
  image: galleryBordplade[index]
    ? {
        src: galleryBordplade[index],
        alt: "Massiv træbordplade efter slibning og behandling"
      }
    : undefined
}));

if (caseGalleryItemsWithImages[0]) {
  caseGalleryItemsWithImages[0].image = {
    src: "/media/galleries:bordplade:before-after/case-006_koekken/before.jpg",
    alt: "Køkkenbord før slibning med skjolder ved vask",
    hoverSrc: "/media/galleries:bordplade:before-after/case-006_koekken/after.jpg",
    hoverAlt: "Køkkenbord efter slibning med ensartet finish"
  };
}

if (caseGalleryItemsWithImages[1]) {
  caseGalleryItemsWithImages[1].image = {
    src: "/media/galleries:bordplade:before-after/case-008_koekken/before.jpg",
    alt: "Træbordplade før slibning med fine ridser og ujævn glans",
    hoverSrc: "/media/galleries:bordplade:before-after/case-008_koekken/after.jpg",
    hoverAlt: "Træbordplade efter slibning med roligt og ensartet udtryk"
  };
}

if (caseGalleryItemsWithImages[2]) {
  caseGalleryItemsWithImages[2].image = {
    src: "/media/galleries:bordplade:before-after/case-001_koekken/before.jpg",
    alt: "Massiv bordplade før slibning med varmepletter og misfarvning",
    hoverSrc: "/media/galleries:bordplade:before-after/case-001_koekken/after.jpg",
    hoverAlt: "Massiv bordplade efter slibning med forbedret finish"
  };
}

if (caseGalleryItemsWithImages[3]) {
  caseGalleryItemsWithImages[3].image = {
    src: "/media/galleries:bordplade:before-after/case-009_spisebord/before.jpg",
    alt: "Spisebord før slibning",
    hoverSrc: "/media/galleries:bordplade:before-after/case-009_spisebord/after.jpg",
    hoverAlt: "Spisebord efter slibning"
  };
}

const beforeAfterBordpladePreview = beforeAfterBordplade.slice(0, 4).map((item) => ({
  ...item,
  beforeAlt: "Massiv træbordplade før slibning",
  afterAlt: "Massiv træbordplade efter slibning og behandling"
}));

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
  title: "Bordpladeslibning på Sjælland | Slibning & behandling af bordplader",
  description:
    "Bordpladeslibning i massiv træ på hele Sjælland. Få pris via billeder, book tid eller se akutte tider.",
  path: "/bordpladeslibning-sjaelland"
});

export default function BordpladePillarPage() {
  return (
    <ServicePageLayout
      title="Bordpladeslibning på Sjælland"
      subtitle="Vi hjælper med slibning, genopbygning og finish af massiv træbordplader. Du får tydelig rådgivning, realistiske priser og et forløb der er let at forstå fra første kontakt."
      heroBackgroundImage="/media/galleries%3Abordplade%3Asingles%3Ahero/singles%3Ahero_6.HEIC"
      bullets={[
        "Slibning & behandling af massive træbordplader",
        "Få vurdering via billeder – hurtigt og konkret",
        "Dækker hele Sjælland + lokale områder"
      ]}
      primaryCta={{ label: "Book tid", href: "/bordpladeslibning/book" }}
      secondaryCta={{ label: "Få pris via billeder", href: "/bordpladeslibning/prisberegner" }}
    >
      <ProcessSteps />

      <ProblemCards
        title="Typiske bordplade-problemer vi løser"
        subtitle="Hvis bordpladen er massiv træ, kan slibning og korrekt behandling ofte give et markant løft."
        items={problemCardsItems}
      />

      <CaseGallery
        title="Eksempler på typiske bordplade-opgaver"
        subtitle="Et hurtigt overblik over opgavetyper vi ofte vurderer via billeder, før vi planlægger næste skridt."
        items={caseGalleryItemsWithImages}
        cta={{ label: "Få vurdering via billeder", href: "/bordpladeslibning/prisberegner" }}
      />

      <BeforeAfterGrid
        title="Før & efter: bordplader"
        items={beforeAfterBordpladePreview}
      />

      <MidPageCTA
        title="Vil du have en hurtig vurdering?"
        subtitle="Upload 3–6 billeder og få et konkret forslag til næste skridt – uden at gætte."
        primary={{ label: "Få vurdering via billeder", href: "/bordpladeslibning/prisberegner" }}
        secondary={{ label: "Se priseksempler", href: "/bordpladeslibning/pris" }}
      />

      <div className="[&_h2]:font-sans [&_h2]:tracking-tight">
      <section className="grid gap-6 py-10 lg:grid-cols-[1.08fr_0.92fr] md:py-14">
        <article className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Bordpladeslibning på Sjælland – når en slibning kan erstatte en udskiftning
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            Mange søger efter “bordpladeslibning Sjælland”, når køkkenbordet er blevet slidt af
            daglig brug. Det kan være skjolder ved vasken, ridser i arbejdsområdet eller et generelt
            mat og ujævnt udtryk. Hvis bordpladen er massiv træ, kan slibning af bordplade og den
            rigtige behandling ofte give en bordplade, der føles og ser væsentligt nyere ud — uden at
            du skal udskifte den.
          </p>
          <ul className="mt-5 grid gap-3 text-[15px] leading-relaxed font-sans text-muted-foreground sm:grid-cols-2">
            <li className="rounded-2xl border border-border/70 bg-background/80 p-3">Slibning af køkkenbordplade: udjævner overfladen og reducerer ridser og ujævn glans</li>
            <li className="rounded-2xl border border-border/70 bg-background/80 p-3">Afslibning af bordplade: fjerner slidte zoner og gør bordpladen klar til ny finish</li>
            <li className="rounded-2xl border border-border/70 bg-background/80 p-3">Renovering af køkkenbordplade: kombinationen af slibning + korrekt behandling til din hverdag</li>
            <li className="rounded-2xl border border-border/70 bg-background/80 p-3">Slibning af træbordplade: relevant når bordpladen er massiv træ og egnet til processen</li>
          </ul>
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-border/70">
          <Image
            src="/media/featured%3Abordplade/20210308_105216.jpg"
            alt="Bordplade i køkken efter slibning"
            fill
            sizes="(max-width: 1023px) 100vw, 40vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/10 to-transparent" />
          <div className="absolute bottom-0 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.15em] text-white/80">Sjælland cases</p>
            <p className="mt-2 text-base font-semibold">Massivt træ kan ofte reddes med den rigtige proces</p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 py-10 md:grid-cols-2 md:py-14">
        <article className="rounded-3xl border border-sky-200/80 bg-gradient-to-br from-sky-100/90 via-white to-cyan-100/80 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Hvad betyder “behandling” efter slibning?</h2>
          <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            Når bordpladen er slebet, er den klar til behandling. Behandlingen er det, der bestemmer
            både udtryk og hvor nem bordpladen bliver at leve med. Nogle vil have et mere naturligt
            look, andre vil have en overflade der kræver mindst muligt i daglig drift. Vi rådgiver ud
            fra brug, så løsningen passer til køkkenets virkelighed.
          </p>
          <ul className="mt-4 grid gap-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            <li>Olie: naturligt udtryk, typisk mere løbende pleje</li>
            <li>Lak: mere lukket/robust overflade, ofte nemmere i drift</li>
            <li>Det bedste valg afhænger af vand, varme, madlavning og hvor “perfekt” du vil holde bordpladen</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-100/90 via-white to-orange-100/80 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Hvornår giver bordpladeslibning mest værdi?</h2>
          <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            Bordpladeslibning giver typisk mest værdi, når bordpladen er stabil og massiv, men
            overfladen er slidt. Målet er et ensartet udtryk og en finish, der passer til hvordan du
            bruger køkkenet.
          </p>
          <ul className="mt-4 grid gap-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            <li>Når bordpladen er mat, ru eller “plettet” i lyset</li>
            <li>Når skjolder og ringe ikke længere kan rengøres væk</li>
            <li>Når ridser og mærker gør overfladen urolig</li>
            <li>Når du vil skifte finish for at få en mere praktisk hverdag</li>
          </ul>
        </article>
      </section>

      <section className="grid gap-6 py-10 lg:grid-cols-[0.95fr_1.05fr] md:py-14">
        <article className="relative min-h-[280px] overflow-hidden rounded-3xl border border-border/70">
          <Image
            src="/media/featured%3Abordplade/20210302_160950.jpg"
            alt="Massiv træbordplade med varm finish"
            fill
            sizes="(max-width: 1023px) 100vw, 38vw"
            className="object-cover"
          />
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Bordpladeafslibning på Sjælland – når du vil bevare det du allerede har
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            En massiv træbordplade kan ofte have mange gode år tilbage, selvom den ser slidt ud.
            Formålet med bordpladeslibning er at genskabe en ensartet overflade og vælge en
            behandling, der passer til din hverdag. Det er især relevant, hvis du har pletter,
            ridser, matte zoner eller varmeaftryk, men stadig har en bordplade i massiv træ.
          </p>
          <ul className="mt-4 grid gap-3 text-[15px] leading-relaxed font-sans text-muted-foreground sm:grid-cols-3">
            <li className="rounded-2xl border border-border/70 bg-background/80 p-3">Genskaber et roligt udtryk ved at udjævne overfladen trinvis</li>
            <li className="rounded-2xl border border-border/70 bg-background/80 p-3">Gør bordpladen mere praktisk ved at vælge den rigtige finish til brugen</li>
            <li className="rounded-2xl border border-border/70 bg-background/80 p-3">Kan være et stærkt alternativ til udskiftning, hvis materialet er egnet</li>
          </ul>
        </article>
      </section>

      <section className="grid gap-6 py-10 md:grid-cols-2 md:py-14">
        <article className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Hvad vi typisk hjælper med</h2>
          <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            Bordplader slides forskelligt alt efter brug og tidligere behandling. Her er de mest
            almindelige årsager til at kunder kontakter os:
          </p>
          <ul className="mt-4 grid gap-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            <li>Skjolder og ringe fra vand, varme og daglig brug</li>
            <li>Ridser og mærker der gør overfladen ujævn i lys</li>
            <li>Matte felter og “tørre” zoner, hvor finishen er slidt væk</li>
            <li>Varmepletter og små brændemærker (afhænger af dybde og trætype)</li>
            <li>Bordplader der er svære at holde pæne, fordi overfladen er porøs eller ujævn</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-100/80 via-white to-teal-100/70 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Massiv træ eller finér? Det afklarer alt</h2>
          <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            Vi arbejder med massive træbordplader. Hvis bordpladen er finér eller laminat, kan klassisk
            slibning være begrænset eller risikabel. Derfor starter vi altid med at afklare opbygningen
            — ofte kan et billede af kanten eller enden (endetræ) give svaret med det samme.
          </p>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm" className="h-10 px-4">
              <Link href="/bordpladeslibning/kan-det-slibes">Læs guiden: kan det slibes?</Link>
            </Button>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sådan foregår bordpladeslibning (kort og realistisk)</h2>
        <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
          Vi arbejder struktureret og trinvis, så vi ikke fjerner mere materiale end nødvendigt.
          Målet er en overflade der føles ens og ser ens ud, og som er klar til den finish du
          vælger.
        </p>
        <ol className="mt-4 grid gap-3 text-[15px] leading-relaxed font-sans text-muted-foreground md:grid-cols-2 lg:grid-cols-5">
          <li className="rounded-2xl border border-border/70 bg-background/80 p-3">1. Materiale og tilstand afklares (ofte via billeder)</li>
          <li className="rounded-2xl border border-border/70 bg-background/80 p-3">2. Overfladen slibes trinvis ud fra skader og eksisterende behandling</li>
          <li className="rounded-2xl border border-border/70 bg-background/80 p-3">3. Kanter og udskæringer gennemgås, så helhedsindtrykket bliver pænt</li>
          <li className="rounded-2xl border border-border/70 bg-background/80 p-3">4. Finish påføres ud fra brug og ønsket vedligehold (olie/lak m.m.)</li>
          <li className="rounded-2xl border border-border/70 bg-background/80 p-3">5. Aflevering med råd til brug, tørretid og vedligehold</li>
        </ol>
      </section>

      <section className="grid gap-6 py-10 md:grid-cols-2 md:py-14">
        <article className="rounded-3xl border border-border/70 bg-white/80 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Pris: få et konkret svar uden at gætte</h2>
          <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            Prisen afhænger af mål, skader og finishvalg. Den hurtigste vej til en præcis vurdering
            er at starte med billeder, så vi kan se både helheden og de værste områder. På den måde
            kan vi anbefale den rigtige løsning og undgå overraskelser.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm" className="h-10 px-4">
              <Link href="/bordpladeslibning/pris">Se priseksempler</Link>
            </Button>
            <Button asChild size="sm" className="h-10 px-4">
              <Link href="/bordpladeslibning/prisberegner">Få vurdering via billeder</Link>
            </Button>
          </div>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/80 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Olie eller lak – hvad betyder det for dig?</h2>
          <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            Valg af finish handler om både udtryk og drift. Nogle ønsker et mere naturligt look og
            accepterer løbende pleje, mens andre vil have en overflade der kræver mindst muligt i
            hverdagen. Vi rådgiver ud fra hvordan bordpladen bruges, så finishvalget passer til din
            hverdag.
          </p>
          <ul className="mt-4 grid gap-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            <li>Olie kan give et varmt udtryk og kræver typisk mere løbende vedligehold</li>
            <li>Lak kan være mere lukket/robust og ofte nemmere i daglig drift</li>
            <li>Det bedste valg afhænger af brug, forventninger og hvor “perfekt” du vil holde overfladen</li>
          </ul>
        </article>
      </section>

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-orange-100/80 via-white to-amber-100/80 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Derfor vælger mange bordpladeslibning fremfor udskiftning
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
          Hvis bordpladen er massiv træ og ellers er stabil, kan slibning være en effektiv måde at
          løfte køkkenet på uden at starte forfra. Du bevarer materialet, får en ny overflade og kan
          vælge en finish der passer bedre til din brug i dag end den oprindelige gjorde.
        </p>
        <ul className="mt-4 grid gap-3 text-[15px] leading-relaxed font-sans text-muted-foreground sm:grid-cols-3">
          <li className="rounded-2xl border border-border/70 bg-background/80 p-3">Du bevarer træets udtryk og kvalitet</li>
          <li className="rounded-2xl border border-border/70 bg-background/80 p-3">Du kan ændre finish og vedligeholdsniveau</li>
          <li className="rounded-2xl border border-border/70 bg-background/80 p-3">Du får et synligt resultat uden at udskifte hele bordpladen</li>
        </ul>
      </section>

      <section className="grid gap-6 py-10 md:grid-cols-2 md:py-14">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Prisfaktorer og forventninger</h2>
          <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
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
          <p className="mt-3 text-[15px] leading-relaxed font-sans text-muted-foreground">
            Vi hjælper med valg mellem olie og lak, og vi håndterer ofte skjolder, ridser og
            slidt/mat overflade som en del af samme opgave. Vi kan udføre sæbebehandling, men
            anbefaler normalt olie eller lak til bordplader.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 px-3">
              <Link href="/bordpladeslibning/olie-eller-lak">Olie eller lak</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-9 px-3">
              <Link href="/bordpladeslibning/skjolder">Skjolder</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-9 px-3">
              <Link href="/bordpladeslibning/slidt-mat-overflade">Slidt/mat overflade</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-9 px-3">
              <Link href="/bordpladeslibning/ridser">Ridser</Link>
            </Button>
          </div>
        </article>
      </section>
      </div>

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
    </ServicePageLayout>
  );
}
