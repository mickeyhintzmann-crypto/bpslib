import Link from "next/link";

import { CtaRow } from "@/components/bordplade/CtaRow";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { InternalLinkGrid } from "@/components/bordplade/InternalLinkGrid";
import { PageHero } from "@/components/bordplade/PageHero";
import {
  StructuredData,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvordan ser jeg forskel på massiv træ og finer?",
    answer:
      "Kig på kanten: massiv træ viser gennemgående struktur, mens finer ofte har tyndt toplag over andet materiale."
  },
  {
    question: "Kan laminat slibes?",
    answer:
      "Som udgangspunkt nej. Laminat har ikke et massivt toplag der tåler almindelig afslibning."
  },
  {
    question: "Hvad hvis jeg er i tvivl om materialet?",
    answer:
      "Upload et tydeligt kantbillede i prisberegneren, så afklarer vi det hurtigt før du booker."
  },
  {
    question: "Kan finer reddes med let slibning?",
    answer:
      "Risikoen for gennems libning er høj. Vi anbefaler altid afklaring før enhver behandling."
  },
  {
    question: "Tager I stadig opgaven hvis den ikke er massiv?",
    answer:
      "Vi sliber kun massiv træ, men vi henviser venligt til tilbudstid eller kontakt for alternativer."
  },
  {
    question: "Koster afklaringen noget?",
    answer:
      "Nej, den indledende billedafklaring er en del af vores normale vurdering."
  },
  {
    question: "Hvilke billeder skal jeg sende?",
    answer:
      "Send 3–6 billeder af overfladen og mindst ét tydeligt billede af kanten eller endetræet."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Kan bordpladen slibes?",
  description:
    "Afklaring af om bordplader er massiv træ, finer eller laminat, samt anbefalet næste skridt før behandling.",
  url: "https://bpslib.dk/bordpladeslibning/kan-det-slibes"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning på Sjælland",
    item: "https://bpslib.dk/bordpladeslibning-sjaelland"
  },
  {
    name: "Kan det slibes?",
    item: "https://bpslib.dk/bordpladeslibning/kan-det-slibes"
  }
]);

export const metadata = buildMetadata({
  title: "Kan bordpladen slibes?",
  description:
    "Se hvordan du afgør om bordpladen er massiv træ, finer eller laminat. Upload kantbillede og få hurtig afklaring.",
  path: "/bordpladeslibning/kan-det-slibes"
});

export default function KanDetSlibesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <PageHero
        eyebrow="Materialeafklaring"
        title="Kan din bordplade slibes?"
        intro="Vi sliber kun massiv træ. Her får du en enkel måde at afklare materiale hurtigt, så du undgår at bruge tid og budget på en forkert løsning."
      />

      <section className="grid gap-6 py-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Massiv træ vs. finer/laminat</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Massiv træ:</span> træstruktur går typisk
              gennem hele kanten, og mønsteret virker ikke som et tyndt toplag.
            </p>
            <p>
              <span className="font-semibold text-foreground">Finér:</span> tyndt ægte trælag ovenpå en
              kerne. Risiko for gennems libning ved behandling.
            </p>
            <p>
              <span className="font-semibold text-foreground">Laminat:</span> kunstig overflade uden
              slibebart massivt lag.
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Sådan afklarer vi hurtigt</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Upload et kantbillede sammen med 3–6 billeder af overfladen. Vi giver hurtig besked om
            bordpladen er egnet til slibning, og hvad næste skridt er.
          </p>
          <div className="mt-5">
            <CtaRow primaryLabel="Upload og få afklaring" />
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvis bordpladen ikke er massiv</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Hvis materialet ikke er massivt træ, hjælper vi dig videre på en ordentlig måde. Du kan
          sende opgaven via tilbudstid eller kontakte os direkte for en alternativ løsning.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/tilbudstid">Gå til tilbudstid</Link>
          </Button>
          <Button asChild>
            <Link href="/kontakt">Kontakt os</Link>
          </Button>
        </div>
      </section>

      <InternalLinkGrid
        title="Relaterede sider"
        intro="Brug links her til pris, booking og de mest efterspurgte problem-sider."
        links={[
          { href: "/bordpladeslibning-sjaelland", label: "Bordpladeslibning på Sjælland" },
          { href: "/bordpladeslibning/pris", label: "Prisguide" },
          { href: "/bordpladeslibning/prisberegner", label: "Prisberegner" },
          { href: "/bordpladeslibning/book", label: "Book tid" },
          { href: "/bordpladeslibning/skjolder", label: "Skjolder" },
          { href: "/bordpladeslibning/ridser", label: "Ridser" },
          { href: "/akutte-tider", label: "Akutte tider" }
        ]}
      />

      <FaqSection
        items={faqItems}
        intro="Disse spørgsmål hjælper med hurtig afklaring, før du går videre til pris eller booking."
      />

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </main>
  );
}
