import Link from "next/link";

import { ReferenceStrip } from "@/components/ReferenceStrip";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Kan I udføre gulvafslibning i lejlighed uden at det bliver kaos?",
    answer:
      "Ja - vi planlægger efter adgang, opgang og tidsvinduer og bruger støvkontrol/afdækning. Der vil altid være noget støv ved slibning, men vi gør det så kontrolleret som muligt."
  },
  {
    question: "Hvad betyder finish-valget i praksis?",
    answer:
      "Lak er typisk mest slidstærk og nem i daglig drift. Olie giver et naturligere udtryk og kan ofte punkt-vedligeholdes. Sæbe giver et lyst/mat look, men kræver mere løbende pleje."
  },
  {
    question: "Hvad koster gulvafslibning i Roskilde?",
    answer:
      "Det afhænger især af m², gulvtype, tilstand og ønsket behandling. Book en tilbudstid, så giver vi en konkret vurdering."
  },
  {
    question: "Skal vi flytte møbler, før I kommer?",
    answer:
      "Som udgangspunkt ja i det område der skal slibes. Hvis du har tunge elementer, så skriv det - så planlægger vi det."
  },
  {
    question: "Hvor lang tid tager det typisk?",
    answer:
      "Det varierer med opgavens størrelse og efterbehandling. Du får en realistisk tidsplan i forbindelse med tilbuddet."
  },
  {
    question: "Kan I også hjælpe i Trekroner/Svogerslev/Jyllinge?",
    answer:
      "Ja - vi dækker hele området og planlægger ruter og opgaver samlet for stabil tidsplan."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning i Roskilde | Uforpligtende tilbud | BP Slib",
  description:
    "Gulvafslibning i Roskilde og Trekroner. Uforpligtende tilbud baseret på gulvtype, m² og finish. Erfaring fra bl.a. Rigshospitalets Patienthotel og Brdr. Price Tivoli. Book tilbudstid.",
  path: "/gulvafslibning-roskilde"
});

export default function GulvRoskildePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvafslibning i Roskilde
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi hjælper med gulvafslibning i Roskilde og omegn - fra lejligheder tæt på centrum til huse
          i Trekroner og de omkringliggende områder. Det vigtigste for et godt resultat er korrekt
          vurdering af gulvtype (parket/plank/sildeben), adgangsforhold og den finish, du vil leve med
          bagefter.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Du får et uforpligtende tilbud baseret på m², tilstand og ønsket behandling (lak, olie eller
          sæbe). Vi planlægger realistisk og afklarer praktiske forhold som adgang, parkering og
          tidsvinduer, så forløbet bliver smidigt.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Erfaring fra større projekter: Rigshospitalets Patienthotel, Brdr. Price Tivoli,
          Skatteministeriet og Boldens Gård.
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

      <ReferenceStrip />

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Eksempel på opgave i området</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">Udgangspunkt:</span> Slidt trægulv med ridser, matte felter og ujævn glans (typisk i stue/alrum).
          </li>
          <li>
            <span className="font-semibold text-foreground">Løsning:</span> Slibning i kontrollerede trin + valg af finish efter brug (fx slidstærk lak i høj trafik / olie ved naturligt look).
          </li>
          <li>
            <span className="font-semibold text-foreground">Resultat:</span> Ensartet overflade, roligt udtryk og et gulv der er nemmere at holde pænt i hverdagen.
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
          Roskilde, Trekroner, Svogerslev, Veddelev, Viby Sjælland, Gadstrup, Jyllinge, Lejre (nært).
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
