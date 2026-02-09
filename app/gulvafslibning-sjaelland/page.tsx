import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvad koster gulvafslibning?",
    answer:
      "Prisen afhænger af gulvtype, areal, tilstand og efterbehandling. Vi giver et uforpligtende tilbud ud fra opgaven."
  },
  {
    question: "Hvornår er slibning nok, og hvornår kræves afhøvling?",
    answer:
      "Slibning rækker langt i de fleste tilfælde. Ved meget ujævne gulve eller dybe skader kan afhøvling være nødvendig."
  },
  {
    question: "Lak, olie eller sæbe – hvad anbefaler I?",
    answer:
      "Lak er slidstærk, olie giver et naturligt udtryk, og sæbe giver et lyst og mat look. Vi rådgiver ud fra brug og ønsker."
  },
  {
    question: "Hvor lang tid tager opgaven?",
    answer:
      "Det afhænger af areal og behandling. Vi giver en realistisk tidsplan i forbindelse med tilbuddet."
  },
  {
    question: "Støver det meget?",
    answer:
      "Vi arbejder med støvkontrol og afdækning, men der vil altid være noget støv ved slibning."
  },
  {
    question: "Kører I på hele Sjælland?",
    answer:
      "Ja, vi dækker hele Sjælland og planlægger opgaverne, så du får en stabil tidsplan."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning på Sjælland | Slibning & efterbehandling af trægulve",
  description:
    "Professionel gulvafslibning og efterbehandling på Sjælland. Book uforpligtende tilbudstid eller kontakt os for en vurdering.",
  path: "/gulvafslibning-sjaelland"
});

export default function GulvHubPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvafslibning på Sjælland
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi hjælper med gulvafslibning på hele Sjælland. Du får et uforpligtende tilbud baseret på
          gulvtype, areal og ønsket finish. Vi planlægger realistisk og giver dig en klar forventning
          til både pris og proces.
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
            <li>Gulvslibning og opfriskning af slidte gulve</li>
            <li>Vurdering af om afhøvling er nødvendig</li>
            <li>Efterbehandling med lak, olie eller sæbe</li>
            <li>Udbedring af ridser, pletter og misfarvning</li>
            <li>Parket, plankegulve og sildeben</li>
          </ul>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Sådan foregår det</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>1. Du booker en tilbudstid og beskriver opgaven kort.</li>
            <li>2. Vi afklarer gulvtype, behandling og praktiske forhold.</li>
            <li>3. Du modtager et tilbud og en konkret tidsplan.</li>
          </ol>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvornår er slibning nok?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Slibning er ofte tilstrækkeligt ved almindeligt slid, matte overflader og overfladiske
          skader. Ved dybe hak, ujævnheder eller meget tykke behandlinger kan der være behov for
          ekstra forarbejde. Læs mere om processen på{" "}
          <Link href="/gulvafslibning/gulvslibning" className="font-medium text-foreground hover:text-primary">
            gulvslibning
          </Link>
          , eller få hjælp til skader som{" "}
          <Link href="/gulvafslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser og pletter
          </Link>
          .
        </p>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h3 className="text-lg font-semibold text-foreground">Lak</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Slidstærk overflade der tåler hverdagens brug.
          </p>
          <Link href="/gulvafslibning/lak" className="mt-3 inline-flex text-sm font-medium text-foreground hover:text-primary">
            Læs om lak
          </Link>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h3 className="text-lg font-semibold text-foreground">Olie</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Naturligt udtryk med god mulighed for løbende vedligehold.
          </p>
          <Link href="/gulvafslibning/olie" className="mt-3 inline-flex text-sm font-medium text-foreground hover:text-primary">
            Læs om olie
          </Link>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h3 className="text-lg font-semibold text-foreground">Sæbe</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Lys, mat finish som kræver mere regelmæssig pleje.
          </p>
          <Link href="/gulvafslibning/saebe" className="mt-3 inline-flex text-sm font-medium text-foreground hover:text-primary">
            Læs om sæbe
          </Link>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Pris og tilbud</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen påvirkes af gulvtype, mængden af slibning, antal rum og ønsket efterbehandling. Se
          prisfaktorer på{" "}
          <Link href="/gulvafslibning/pris" className="font-medium text-foreground hover:text-primary">
            gulvafslibning/pris
          </Link>
          , og book en tilbudstid hvis du ønsker en konkret vurdering.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder vi dækker</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi dækker hele Sjælland og planlægger opgaver efter område og tilgængelighed. Se alle
          områder på{" "}
          <Link href="/gulvafslibning/omraader" className="font-medium text-foreground hover:text-primary">
            gulvafslibning/omraader
          </Link>
          .
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          København, Frederiksberg, Roskilde, Køge, Næstved, Slagelse, Holbæk, Hillerød, Gentofte og
          omegn.
        </p>
      </section>

      <FaqSection
        items={faqItems}
        title="FAQ om gulvafslibning"
        intro="Kort overblik før du booker en uforpligtende tilbudstid."
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
