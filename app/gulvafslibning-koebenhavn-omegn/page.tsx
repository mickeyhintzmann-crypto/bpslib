import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvad koster gulvafslibning?",
    answer:
      "Prisen afhænger af gulvtype, areal og behandling. Send en kort beskrivelse, så får du et tilbud."
  },
  {
    question: "Hvornår vælger man afhøvling?",
    answer:
      "Afhøvling bruges når gulvet er meget ujævnt eller har dybe skader, der ikke kan slibes væk."
  },
  {
    question: "Lak eller olie?",
    answer:
      "Lak giver en robust overflade, olie giver et mere naturligt udtryk. Vi rådgiver ud fra brug og ønsket finish."
  },
  {
    question: "Hvor lang tid tager det?",
    answer:
      "Tiden afhænger af opgavens størrelse og behandling. Vi giver en realistisk tidsplan i tilbuddet."
  },
  {
    question: "Støver det meget?",
    answer:
      "Vi bruger støvkontrol og afdækning, men der vil altid være noget støv ved gulvslibning."
  },
  {
    question: "Kører I i hele København og omegn?",
    answer:
      "Ja, vi dækker København og omegn og planlægger ruter, så tiderne er stabile."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning i København & omegn | Uforpligtende tilbud | BPSLIB",
  description:
    "Gulvafslibning i København og omegn. Book uforpligtende tilbudstid eller kontakt os. Vi kører på hele Sjælland.",
  path: "/gulvafslibning-koebenhavn-omegn"
});

export default function GulvKoebenhavnOmegnPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvafslibning i København & omegn
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi hjælper med gulvafslibning i København og omegn som lead-gen i MVP. Du får et
          uforpligtende tilbud baseret på opgavens omfang, gulvtype og ønsket behandling. Vi
          planlægger stabilt og kører på hele{" "}
          <Link href="/gulvafslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            Sjælland
          </Link>
          .
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tilbudstid">Book tilbudstid</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/kontakt">Kontakt os</Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Hvad vi hjælper med</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Gulvslibning og opfriskning</li>
            <li>Afhøvling ved dybe skader</li>
            <li>Lak, olie eller sæbebehandling</li>
            <li>Udbedring af ridser og pletter</li>
          </ul>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Sådan foregår det</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>1. Send en kort beskrivelse via tilbudstid.</li>
            <li>2. Vi afklarer opgaven og anbefaler behandling.</li>
            <li>3. Du får et tilbud og en konkret tidsplan.</li>
          </ol>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Pris</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen afhænger af gulvtype, areal og behandling. Se vores{" "}
          <Link href="/gulvafslibning/pris" className="font-medium text-foreground hover:text-primary">
            pris-side
          </Link>
          , og læs om finishmuligheder som{" "}
          <Link href="/gulvafslibning/lak" className="font-medium text-foreground hover:text-primary">
            lak
          </Link>
          ,{" "}
          <Link href="/gulvafslibning/olie" className="font-medium text-foreground hover:text-primary">
            olie
          </Link>
          , eller{" "}
          <Link href="/gulvafslibning/saebe" className="font-medium text-foreground hover:text-primary">
            sæbe
          </Link>
          . Vi hjælper også med{" "}
          <Link href="/gulvafslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser og pletter
          </Link>
          .
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder vi dækker</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          København, Frederiksberg, Østerbro, Nørrebro, Vesterbro, Valby, Vanløse, Amager, Hvidovre,
          Rødovre, Gentofte, Lyngby.
        </p>
      </section>

      <FaqSection
        items={faqItems}
        title="Ofte stillede spørgsmål om gulvafslibning"
        intro="Svarene her giver et hurtigt overblik før du booker tilbudstid."
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
