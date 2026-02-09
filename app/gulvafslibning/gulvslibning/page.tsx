import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvad koster gulvslibning?",
    answer:
      "Prisen afhænger af gulvtype, areal og ønsket finish. Du får et tilbud efter en kort vurdering."
  },
  {
    question: "Hvor lang tid tager det?",
    answer:
      "Tiden afhænger af areal og behandling. Vi giver en realistisk tidsplan, når vi har set opgaven."
  },
  {
    question: "Støver det meget?",
    answer:
      "Vi bruger støvkontrol og afdækning, men der vil altid være noget støv ved gulvafslibning."
  },
  {
    question: "Lak eller olie – hvad passer bedst?",
    answer:
      "Lak er mere slidstærk, olie giver et mere naturligt udtryk. Vi rådgiver ud fra rum og brug."
  },
  {
    question: "Kan parket eller sildeben slibes?",
    answer:
      "Ja, ofte kan parket og sildeben slibes, men det afhænger af slidlagets tykkelse."
  },
  {
    question: "Hvordan booker jeg tilbudstid?",
    answer:
      "Du booker uforpligtende tilbudstid via formularen, så vender vi hurtigt tilbage."
  }
];

export const metadata = buildMetadata({
  title: "Gulvslibning | Sådan foregår slibning af trægulv | BPSLIB",
  description:
    "Gulvslibning af trægulve på Sjælland. Book uforpligtende tilbudstid eller kontakt os.",
  path: "/gulvafslibning/gulvslibning"
});

export default function GulvslibningPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvslibning af trægulve
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Gulvslibning giver trægulve et nyt udtryk og fjerner slid, ridser og ujævn glans. Vi udfører
          gulvslibning på hele Sjælland og hjælper med at vælge den rigtige behandling efter slibningen.
          Se også vores oversigt for{" "}
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
        <h2 className="text-2xl font-semibold text-foreground">Hvad er gulvslibning?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Gulvslibning fjerner det øverste slidlag og udjævner overfladen, så gulvet bliver ensartet igen.
          Det er typisk nok til at fjerne almindelige ridser og misfarvninger.
        </p>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Hvornår er slibning nok – og hvornår kræves afhøvling?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Slibning er ofte nok ved almindeligt slid. Ved meget dybe skader kan afhøvling være nødvendig.
            Vi vurderer opgaven og rådgiver om den rette metode, så du får et holdbart resultat.
          </p>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Efterbehandling</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Efter slibning vælger vi den finish, der passer til rummet. Du kan vælge mellem{" "}
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
            . Vi rådgiver ud fra brug og vedligehold.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Pris</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen afhænger af gulvtype, areal og behandling. Se vores{" "}
          <Link href="/gulvafslibning/pris" className="font-medium text-foreground hover:text-primary">
            pris-side
          </Link>
          , og læs mere om typiske skader som{" "}
          <Link href="/gulvafslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser
          </Link>
          .
        </p>
      </section>

      <FaqSection
        items={faqItems}
        title="Ofte stillede spørgsmål om gulvslibning"
        intro="Svarene her giver et hurtigt overblik før du booker tilbudstid."
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
