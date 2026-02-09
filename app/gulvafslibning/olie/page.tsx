import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvor holdbar er oliebehandling?",
    answer:
      "Olie giver en naturlig overflade, men kræver løbende vedligehold. Holdbarheden afhænger af brug og pleje."
  },
  {
    question: "Olie eller lak – hvad vælger man?",
    answer:
      "Olie giver et varmt og naturligt udtryk, lak er mere slidstærk. Vi hjælper med at vælge ud fra rum og brug."
  },
  {
    question: "Kan man pletreparere olie?",
    answer:
      "Ja, olie er ofte nemmere at pletreparere end lak. Det kræver dog korrekt rengøring og efterbehandling."
  },
  {
    question: "Hvor lang tid tager det?",
    answer:
      "Tiden afhænger af areal og antal lag. Vi giver en realistisk tidsplan, når vi har set opgaven."
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
  title: "Oliebehandling af gulv | Efter gulvafslibning | BPSLIB",
  description:
    "Oliebehandling efter gulvafslibning. Book uforpligtende tilbudstid eller kontakt os. Vi kører på hele Sjælland.",
  path: "/gulvafslibning/olie"
});

export default function GulvOliePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Oliebehandling af gulv efter gulvafslibning
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Olie er et populært valg efter gulvafslibning, fordi det giver et varmt og naturligt
          udtryk. Overfladen er nem at pletreparere, men kræver løbende vedligehold. Vi hjælper med
          oliebehandling på hele Sjælland og rådgiver om den rigtige type olie og glans. Læs også om
          vores overblik for{" "}
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
        <h2 className="text-2xl font-semibold text-foreground">Fordele ved olie</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Naturligt udtryk og varm glød i træet</li>
          <li>Nemmere pletreparation end lak</li>
          <li>Behagelig overflade til daglig brug</li>
          <li>Mulighed for at justere udtryk med tone og glans</li>
        </ul>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Vedligehold</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Olie kræver løbende pleje for at bevare udseendet. Vi giver konkrete råd om rengøring og
            genopfriskning, så gulvet holder sig pænt. I nogle rum kan lak eller sæbe være bedre valg,
            og vi rådgiver gerne om alternativer.
          </p>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Sådan foregår det</h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1. Vurdering og plan for slibning og oliebehandling</li>
            <li>2. Slibning og klargøring af overfladen</li>
            <li>3. Påføring af olie og aftørring i passende lag</li>
          </ol>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Pris</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen afhænger af gulvtype, areal og ønsket behandling. Se vores{" "}
          <Link href="/gulvafslibning/pris" className="font-medium text-foreground hover:text-primary">
            pris-side
          </Link>
          , og læs om muligheder som{" "}
          <Link href="/gulvafslibning/lak" className="font-medium text-foreground hover:text-primary">
            lak
          </Link>
          ,{" "}
          <Link href="/gulvafslibning/saebe" className="font-medium text-foreground hover:text-primary">
            sæbe
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
        title="Ofte stillede spørgsmål om oliebehandling"
        intro="Svarene her giver et hurtigt overblik før du booker tilbudstid."
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
