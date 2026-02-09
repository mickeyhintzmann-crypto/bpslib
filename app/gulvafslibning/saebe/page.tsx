import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvor holdbar er sæbebehandling?",
    answer:
      "Sæbe giver et naturligt og lyst udtryk, men kræver jævnlig vedligehold. Holdbarheden afhænger af brug og rengøring."
  },
  {
    question: "Sæbe eller olie – hvad vælger man?",
    answer:
      "Sæbe giver et mere råt og lyst look, olie giver mere dybde. Vi hjælper med at vælge ud fra rum og brug."
  },
  {
    question: "Kan man pletreparere sæbe?",
    answer:
      "Ja, mindre pletter kan ofte fjernes med korrekt sæberengøring og efterbehandling."
  },
  {
    question: "Hvor lang tid tager det?",
    answer:
      "Det afhænger af areal og behandling. Vi giver en realistisk tidsplan, når vi har set opgaven."
  },
  {
    question: "Støver det meget?",
    answer:
      "Vi bruger støvkontrol og afdækning, men der vil altid være noget støv ved gulvafslibning."
  },
  {
    question: "Hvordan booker jeg tilbudstid?",
    answer:
      "Du booker uforpligtende tilbudstid via formularen, så vender vi hurtigt tilbage."
  }
];

export const metadata = buildMetadata({
  title: "Sæbebehandling af gulv | Efter gulvafslibning | BPSLIB",
  description:
    "Sæbebehandling efter gulvafslibning. Book uforpligtende tilbudstid eller kontakt os. Vi kører på hele Sjælland.",
  path: "/gulvafslibning/saebe"
});

export default function GulvSaebePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Sæbebehandling af gulv efter gulvafslibning
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Sæbebehandling giver et lyst og naturligt udtryk, som mange vælger til skandinaviske
          gulve. Overfladen er behagelig at gå på, men kræver jævnlig vedligehold for at holde sig
          pæn. Vi hjælper med sæbebehandling på hele Sjælland og rådgiver om rutiner, der passer til
          hverdagens brug. Læs også om{" "}
          <Link href="/gulvafslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            gulvafslibning på Sjælland
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
        <h2 className="text-2xl font-semibold text-foreground">Fordele ved sæbe</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Lyst og naturligt udtryk</li>
          <li>Behagelig overflade med mat finish</li>
          <li>Nem opfriskning med sæberengøring</li>
          <li>Velegnet til nordiske træsorter</li>
        </ul>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Vedligehold</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Sæbebehandlede gulve kræver løbende pleje for at bevare overfladen. Vi giver konkrete råd
            om rengøring og opfriskning, så gulvet holder sig lyst og ensartet. I rum med høj belastning
            kan olie eller lak være et bedre valg.
          </p>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Sådan foregår det</h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1. Vurdering og plan for slibning og sæbebehandling</li>
            <li>2. Slibning og klargøring af overfladen</li>
            <li>3. Påføring af sæbe i passende lag</li>
          </ol>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Pris</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen afhænger af gulvtype, areal og behandling. Se vores{" "}
          <Link href="/gulvafslibning/pris" className="font-medium text-foreground hover:text-primary">
            pris-side
          </Link>
          , og læs om alternativer som{" "}
          <Link href="/gulvafslibning/olie" className="font-medium text-foreground hover:text-primary">
            olie
          </Link>
          ,{" "}
          <Link href="/gulvafslibning/lak" className="font-medium text-foreground hover:text-primary">
            lak
          </Link>
          , eller typiske skader som{" "}
          <Link href="/gulvafslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser og pletter
          </Link>
          . Vi sender et uforpligtende tilbud efter tilbudstid.
        </p>
      </section>

      <FaqSection
        items={faqItems}
        title="Ofte stillede spørgsmål om sæbebehandling"
        intro="Svarene her giver et hurtigt overblik før du booker tilbudstid."
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
