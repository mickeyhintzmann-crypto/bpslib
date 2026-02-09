import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvor holdbar er gulvlak?",
    answer:
      "Gulvlak er en slidstærk overflade, der beskytter mod daglig brug. Holdbarheden afhænger af belastning og vedligehold."
  },
  {
    question: "Mat eller blank – hvad vælger man?",
    answer:
      "Mat giver et roligt udtryk, blank fremhæver træets struktur. Vi hjælper dig med at vælge ud fra rum og brug."
  },
  {
    question: "Kan man pletreparere lak?",
    answer:
      "Mindre skader kan nogle gange udbedres, men ofte giver en samlet overfladebehandling det pæneste resultat."
  },
  {
    question: "Hvor lang tid tager det?",
    answer:
      "Det afhænger af areal og antal lag. Vi giver en realistisk tidsplan, når vi har set opgaven."
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
  title: "Lakering af gulv | Slidstærk finish efter gulvafslibning | BPSLIB",
  description:
    "Lakering efter gulvafslibning. Book uforpligtende tilbudstid eller kontakt os. Vi kører på hele Sjælland.",
  path: "/gulvafslibning/lak"
});

export default function GulvLakPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Lakering af gulv efter gulvafslibning
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Lak er et populært valg efter gulvafslibning, fordi det giver en slidstærk og let rengørbar
          overflade. Vi hjælper med gulvlakering på hele Sjælland og rådgiver om glansgrad og antal
          lag, så gulvet passer til hverdagens brug. Læs også vores oversigt for{" "}
          <Link href="/gulvafslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            gulvafslibning på Sjælland
          </Link>
          , og få et uforpligtende tilbud.
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
        <h2 className="text-2xl font-semibold text-foreground">Fordele ved lak</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Slidstærk overflade til høj daglig belastning</li>
          <li>Let at rengøre og vedligeholde</li>
          <li>Mulighed for mat, halvblank eller blank finish</li>
          <li>God beskyttelse mod pletter og spild</li>
        </ul>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Mat eller blank?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Mat lak giver et roligt og moderne udtryk, mens blank lak fremhæver træets struktur og
            giver mere glans. Valget afhænger af rum, lys og brug. Vi hjælper dig med at vælge den
            rigtige finish, og kan også rådgive om alternativer som{" "}
            <Link href="/gulvafslibning/olie" className="font-medium text-foreground hover:text-primary">
              olie
            </Link>
            eller{" "}
            <Link href="/gulvafslibning/saebe" className="font-medium text-foreground hover:text-primary">
              sæbe
            </Link>
            .
          </p>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Sådan foregår det</h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1. Vurdering og plan for slibning og lakering</li>
            <li>2. Slibning og klargøring af overfladen</li>
            <li>3. Lakering i passende lag og tørretid</li>
          </ol>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Pris</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen afhænger af gulvtype, areal og den ønskede finish. Se vores{" "}
          <Link href="/gulvafslibning/pris" className="font-medium text-foreground hover:text-primary">
            pris-side
          </Link>
          , og læs mere om typiske opgaver som{" "}
          <Link href="/gulvafslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser og pletter
          </Link>
          . Vi sender et uforpligtende tilbud efter tilbudstid.
        </p>
      </section>

      <FaqSection
        items={faqItems}
        title="Ofte stillede spørgsmål om lakering"
        intro="Svarene her giver et hurtigt overblik før du booker tilbudstid."
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
