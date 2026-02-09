import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvad koster gulvafslibning i Hvidovre?",
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
    question: "Hvordan booker jeg tilbudstid?",
    answer:
      "Du booker uforpligtende tilbudstid via formularen, så vender vi hurtigt tilbage."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning i Hvidovre | Uforpligtende tilbud | BPSLIB",
  description: "Gulvafslibning i Hvidovre. Book uforpligtende tilbudstid eller kontakt os.",
  path: "/gulvafslibning-hvidovre"
});

export default function GulvHvidovrePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvafslibning i Hvidovre
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi hjælper med gulvafslibning i Hvidovre som lead-gen i MVP. Området har mange familieboliger
          og rækkehuse, hvor adgang og planlægning er vigtige. Vi tilpasser forløbet, så det passer til
          hverdagen, og du får et uforpligtende tilbud baseret på gulvtype og ønsket behandling. Vi
          kører også i{" "}
          <Link href="/gulvafslibning-koebenhavn-omegn" className="font-medium text-foreground hover:text-primary">
            København og omegn
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

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Mini-case (placeholder)</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">Problem:</span> Slidt gulv med ridser og matte felter i bolig.
          </li>
          <li>
            <span className="font-semibold text-foreground">Løsning:</span> Slibning i trin og ny finish efter ønsket udtryk.
          </li>
          <li>
            <span className="font-semibold text-foreground">Resultat:</span> Jævnt gulv med rolig glans og bedre holdbarhed.
          </li>
        </ul>
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
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder vi dækker</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Hvidovre, Friheden, Avedøre, Brøndby Strand (nært), Rødovre, Valby (nært), Sydhavn (nært),
          Glostrup.
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
