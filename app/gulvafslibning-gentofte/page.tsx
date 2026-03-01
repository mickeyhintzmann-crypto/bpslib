import Link from "next/link";

import { ReferenceStrip } from "@/components/ReferenceStrip";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Kan I slibe, hvis vi bor i etageejendom med fælles opgang?",
    answer:
      "Ja - vi planlægger efter adgang, elevator/tidsvinduer og hensyn til naboer. Skriv gerne praktiske forhold ved booking."
  },
  {
    question: "Hvad er smartest i hjem med børn/høj trafik?",
    answer:
      "Typisk en slidstærk lak. Olie kan være flot og naturligt, men kræver ofte mere vedligehold - vi rådgiver ud fra jeres hverdag."
  },
  {
    question: "Kan I fjerne mørke slidspor og matte felter?",
    answer:
      "Ofte ja, hvis skaden ligger i overfladen. Dybe pletter/ujævnheder kan kræve ekstra forarbejde - det vurderer vi på tilbudstiden."
  },
  {
    question: "Hvordan foregår tilbud og tidsplan?",
    answer:
      "Du booker tilbudstid -> vi afklarer gulvtype/finish/praktik -> du får et konkret tilbud og realistisk tidsplan."
  },
  {
    question: "Støver det meget?",
    answer:
      "Vi bruger støvkontrol og afdækning, men der vil altid være noget støv ved slibning."
  },
  {
    question: "Dækker I også Ordrup/Jægersborg/Vangede?",
    answer:
      "Ja - vi dækker hele området og planlægger opgaverne samlet."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning i Gentofte | Uforpligtende tilbud | BP Slib",
  description:
    "Gulvafslibning i Gentofte, Hellerup og Charlottenlund. Uforpligtende tilbud baseret på gulvtype, m² og finish. Erhvervserfaring fra bl.a. Rigshospitalets Patienthotel og Tivoli. Book tilbudstid.",
  path: "/gulvafslibning-gentofte"
});

export default function GulvGentoftePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvafslibning i Gentofte
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi hjælper med gulvafslibning i Gentofte og nærområder som Hellerup, Charlottenlund og
          Klampenborg. Her møder vi ofte klassiske parketgulve og plankegulve, hvor finish og
          detaljegrad betyder meget - især i stuer, gange og rum med høj daglig brug.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Du får et uforpligtende tilbud baseret på gulvtype, m² og ønsket behandling (lak, olie eller
          sæbe). Vi afklarer adgang, parkering og praktiske forhold på forhånd, så du får en smidig
          proces og en tydelig tidsplan.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Erfaring fra større kunder: Rigshospitalets Patienthotel, Brdr. Price Tivoli,
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
            <span className="font-semibold text-foreground">Udgangspunkt:</span> Parketgulv med slidbaner i gang/stue og små ridser fra daglig brug.
          </li>
          <li>
            <span className="font-semibold text-foreground">Løsning:</span> Slibning i trin + valg af finish, der passer til brugsmønster (ofte lak ved høj trafik).
          </li>
          <li>
            <span className="font-semibold text-foreground">Resultat:</span> Mere ensartet glans, pænere overflade og bedre modstand i hverdagen.
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
          Hellerup, Charlottenlund, Klampenborg, Ordrup, Jægersborg, Dyssegård, Vangede, Gentofte,
          Lyngby (nært).
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
