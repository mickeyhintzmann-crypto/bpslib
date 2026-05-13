import Link from "next/link";

import { AnmeldHaandvaerkerEmbed } from "@/components/AnmeldHaandvaerkerEmbed";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvornår kommer anmeldelserne?",
    answer:
      "Vi forventer at publicere de første anmeldelser inden for den næste måned. Vi indsamler dem løbende efter afsluttede opgaver."
  },
  {
    question: "Hvor kan jeg anmelde jer?",
    answer:
      "Efter endt opgave sender vi et link, så det er let at give en vurdering af forløb og resultat."
  },
  {
    question: "Hvad hvis jeg ikke er tilfreds?",
    answer:
      "Så tager vi dialogen med det samme. Vi følger op efter afleveringen og løser spørgsmål hurtigt og ordentligt."
  },
  {
    question: "Kan jeg se opgaver der ligner min?",
    answer:
      "Ja — se vores cases og referencer. Det er den bedste måde at vurdere finish og niveau før du booker."
  },
  {
    question: "Dækker I hele Sjælland?",
    answer:
      "Ja. Vi planlægger efter opgavens type, adgang og praktiske forhold, så du får en realistisk plan og stabile tider."
  }
];

export const metadata = buildMetadata({
  title: "Anmeldelser | BPSLIB",
  description:
    "Se dokumenteret arbejde, cases og vores proces. Anmeldelser publiceres løbende — første batch forventes inden for den næste måned.",
  path: "/anmeldelser"
});

export default function AnmeldelserPage() {
  const anmeldelserEnabled = siteConfig.anmeldHaandvaerker.enabled;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Anmeldelser
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Her samler vi vores anmeldelser. Vi hjælper dig gerne videre med pris, booking eller
          spørgsmål.
        </p>
      </section>

      <div className="mt-6">
        <AnmeldHaandvaerkerEmbed />
        {!anmeldelserEnabled ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Vi indsamler anmeldelser fra afsluttede opgaver, og de første forventes publiceret inden for den næste måned. Indtil da kan du se dokumenteret arbejde og vores proces herunder.
          </p>
        ) : null}
      </div>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Dokumenteret arbejde – se kvaliteten før du beslutter dig</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Når man vælger håndværk, er resultatet vigtigere end løfter. Derfor har vi samlet konkrete eksempler på finish, materialer og forløb, så du kan vurdere niveauet før du booker.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>Før/efter-eksempler fra rigtige opgaver</li>
          <li>Cases med korte forklaringer på valg af løsning og finish</li>
          <li>Referencer og eksempler på typiske opgavetyper</li>
          <li>Billeder, der viser detaljer (kanter, samlinger, overflade og glans)</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/cases">Se cases (før/efter)</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/referencer">Se referencer</Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sådan indsamler vi anmeldelser</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Efter en afsluttet opgave sender vi et link, hvor kunden kan give en ærlig vurdering af forløb og resultat. Vi foretrækker transparent feedback, fordi det gør os skarpere — og fordi det gør det nemmere for nye kunder at vælge trygt.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>Link sendes efter opgaven er afleveret og gennemgået</li>
          <li>Vi beder om vurdering af både kommunikation, plan og slutresultat</li>
          <li>Når anmeldelserne er live, samler vi dem her på siden i et overskueligt format</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvad du kan forvente af samarbejdet</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi gør det enkelt at komme i gang — og vi gør det tydeligt, hvad du får. Formålet er at minimere overraskelser og sikre et resultat, du kan være tilfreds med i mange år.
        </p>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>
            <span className="font-semibold text-foreground">Kort afklaring</span> – du sender info (og gerne billeder), så vi forstår opgaven fra start
          </li>
          <li>
            <span className="font-semibold text-foreground">Plan og forventninger</span> – vi afklarer adgang, tidsplan, tørretider og praktiske forhold
          </li>
          <li>
            <span className="font-semibold text-foreground">Udførelse</span> – struktureret arbejde med fokus på finish og renlighed undervejs
          </li>
          <li>
            <span className="font-semibold text-foreground">Aflevering</span> – gennemgang af resultatet + råd til vedligehold
          </li>
        </ol>
      </section>

      <FaqSection
        items={faqItems}
        title="Ofte stillede spørgsmål"
        intro="Her er de mest almindelige spørgsmål om anmeldelser, proces og samarbejde."
      />

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Klar til næste skridt?</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Få en vurdering via billeder, book en tid eller kontakt os for afklaring.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/book">Book tid</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/kontakt">Kontakt</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
