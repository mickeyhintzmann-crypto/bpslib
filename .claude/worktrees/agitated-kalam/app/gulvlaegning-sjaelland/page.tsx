import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { ServicePageLayout } from "@/components/layouts/ServicePageLayout";
import { BeforeAfterGrid } from "@/components/media/BeforeAfterGrid";
import { CaseGallery } from "@/components/media/CaseGallery";
import { MidPageCTA } from "@/components/marketing/MidPageCTA";
import { ProblemCards } from "@/components/marketing/ProblemCards";
import {
  StructuredData,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import { buildMetadata } from "@/lib/seo";
import { casesManifest, galleryGulvbelaegning } from "@/lib/mediaManifest";

const faqItems = [
  {
    question: "Hvilke typer gulvbelægning lægger I?",
    answer:
      "Vi arbejder med bl.a. sildebensgulv, parket, vinyl og epoxy-løsninger. Vi anbefaler løsning ud fra drift, udtryk og budget."
  },
  {
    question: "Hvad påvirker prisen på gulvbelægning?",
    answer:
      "Pris afhænger især af m², materialevalg, underlagets stand, mønster (fx sildeben) og afslutninger som lister og overgange."
  },
  {
    question: "Kan I hjælpe med opretning af underlag?",
    answer:
      "Ja, vi vurderer planhed og opbygning før montering og anbefaler nødvendig forberedelse, så gulvet holder stabilt over tid."
  },
  {
    question: "Laver I både privat og erhverv?",
    answer:
      "Ja. Vi udfører gulvbelægning i boliger, butikker og erhvervslokaler og planlægger efter adgang og drift."
  },
  {
    question: "Hvor lang tid tager et gulvbelægningsprojekt?",
    answer:
      "Det afhænger af areal, materialetype og underlag. Du får en realistisk tidsplan efter tilbudstiden."
  },
  {
    question: "Er gulvbelægning det samme som gulvlægning?",
    answer:
      "Ja, i praksis bruges ordene ofte om det samme: montering af nyt gulv inkl. forberedelse og afslutninger."
  }
];

const problemCardsItems = [
  {
    title: "Slidt eller ujævnt eksisterende gulv",
    description:
      "Vi vurderer om underlaget kræver opretning, spartel eller anden forberedelse før ny gulvbelægning."
  },
  {
    title: "Forkert materiale til rummets belastning",
    description:
      "Valg af belægning skal matche trafik, rengøring og fugtforhold. Vi rådgiver ud fra den konkrete hverdag."
  },
  {
    title: "Urolige overgange og afslutninger",
    description:
      "Vi planlægger overgange, lister og kanter, så gulvet fremstår samlet og færdigt."
  },
  {
    title: "Behov for tydelig plan og pris",
    description:
      "Du får et konkret oplæg med materialevalg, opbygning, tidsplan og prisniveau før opstart."
  }
];

const gulvbelaegningCases = casesManifest.filter((item) => item.category === "gulvbelaegning");

const caseGalleryItemsWithImages = gulvbelaegningCases.slice(0, 4).map((item, index) => ({
  title: item.title,
  location: "Sjælland",
  summary:
    "Eksempel på gulvbelægning med fokus på underlag, korrekt opbygning og holdbar afslutning i den daglige drift.",
  image: {
    src: item.frontSrc ?? item.afterSrc ?? item.gallery[0] ?? galleryGulvbelaegning[index] ?? "",
    alt: `${item.title} gulvbelægning case`
  }
})).filter((item) => Boolean(item.image.src));

const beforeAfterGulvbelaegningPreview = gulvbelaegningCases
  .filter((item) => item.beforeSrc && item.afterSrc)
  .slice(0, 4)
  .map((item) => ({
    beforeSrc: item.beforeSrc!,
    afterSrc: item.afterSrc!,
    beforeAlt: `${item.title} før gulvbelægning`,
    afterAlt: `${item.title} efter gulvbelægning`
  }));

const serviceSchema = buildServiceSchema({
  name: "Gulvbelægning på Sjælland",
  description:
    "Gulvbelægning på Sjælland med rådgivning om materialevalg, underlag og afslutninger for et holdbart resultat.",
  url: "https://bpslib.dk/gulvlaegning-sjaelland"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  { name: "Gulvbelægning på Sjælland", item: "https://bpslib.dk/gulvlaegning-sjaelland" }
]);

export const metadata = buildMetadata({
  title: "Gulvbelægning på Sjælland | Sildeben, parket, vinyl & epoxy",
  description:
    "Gulvbelægning på Sjælland med tydelig rådgivning om materialer, opbygning og pris. Se cases og book tilbudstid.",
  path: "/gulvlaegning-sjaelland",
  keywords: [
    "gulvbelægning sjælland",
    "gulvlægning sjælland",
    "sildebensgulv",
    "vinylgulv",
    "parketgulv",
    "epoxygulv"
  ]
});

export default function GulvlaegningSjaellandPage() {
  return (
    <ServicePageLayout
      title="Gulvbelægning på Sjælland"
      subtitle="Vi hjælper med gulvbelægning i bolig og erhverv. Du får et konkret oplæg med materialevalg, opbygning og tidsplan, så løsningen passer til drift, budget og ønsket udtryk."
      heroBackgroundImage="/media/featured%3Agulvbelaegning/1000000509.JPG"
      bullets={[
        "Sildeben, parket, vinyl og epoxy",
        "Underlag, opbygning og afslutninger planlægges korrekt",
        "Uforpligtende tilbudstid med realistisk plan"
      ]}
      primaryCta={{ label: "Book tilbudstid", href: "/tilbudstid" }}
      secondaryCta={{ label: "Se alle gulvbelægning-cases", href: "/gulvlaegning/cases" }}
    >
      <ProblemCards
        title="Typiske udfordringer ved gulvbelægning"
        subtitle="Vi fokuserer på holdbarhed i praksis, ikke kun et pænt billede på dag 1."
        items={problemCardsItems}
      />

      <CaseGallery
        title="Gulvbelægnings-sager"
        subtitle="Udvalgte cases fra gulvbelægning. Se alle sager under den dedikerede caseside for faget."
        items={caseGalleryItemsWithImages}
        cta={{ label: "Se alle gulvbelægning-cases", href: "/gulvlaegning/cases" }}
      />

      <BeforeAfterGrid
        title="Før & efter: gulvbelægning"
        items={beforeAfterGulvbelaegningPreview}
      />

      <MidPageCTA
        title="Klar til nyt gulv?"
        subtitle="Fortæl kort om m², rum og ønsket løsning, så får du et konkret næste skridt med prisramme og plan."
        primary={{ label: "Book tilbudstid", href: "/tilbudstid" }}
        secondary={{ label: "Se priser", href: "/gulvlaegning/pris" }}
      />

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sådan foregår et gulvbelægningsforløb</h2>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>1. Tilbudstid med opmåling, behov og materialevalg.</li>
          <li>2. Vurdering af underlag og plan for opbygning.</li>
          <li>3. Montering af gulvbelægning med fokus på detaljer.</li>
          <li>4. Afslutninger og overgange tilpasset rummene.</li>
          <li>5. Aflevering med råd til vedligehold og drift.</li>
        </ol>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Relaterede sider</h2>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <Link href="/gulvlaegning/cases" className="font-medium text-foreground hover:text-primary">
            /gulvlaegning/cases
          </Link>
          <Link href="/gulvlaegning/pris" className="font-medium text-foreground hover:text-primary">
            /gulvlaegning/pris
          </Link>
          <Link href="/gulvafslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            /gulvafslibning-sjaelland
          </Link>
          <Link href="/cases" className="font-medium text-foreground hover:text-primary">
            /cases
          </Link>
        </div>
      </section>

      <FaqSection
        title="FAQ om gulvbelægning"
        intro="Kort afklaring før du booker tilbudstid."
        items={faqItems}
      />

      <StructuredData data={serviceSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
    </ServicePageLayout>
  );
}
