import Link from "next/link";

import { CityImageHero } from "@/components/layouts/CityImageHero";

import { ReferenceStrip } from "@/components/ReferenceStrip";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { CityServicePage } from "@/components/layouts/CityServicePage";
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
  },
  {
    question: "Hvilken finish anbefaler I til hjem med børn eller høj trafik?",
    answer:
      "Ofte lak, fordi det er mest slidstærkt og typisk nemmest i drift. Olie og sæbe kan være flotte valg, men kræver mere løbende pleje."
  },
  {
    question: "Kan matte felter og slidbaner blive ens igen?",
    answer:
      "Ofte ja. Slibning og en ny finish giver typisk et mere ensartet udtryk. Dybere pletter eller ujævnheder vurderes på tilbudstiden."
  },
  {
    question: "Dækker I også Hellerup og Charlottenlund?",
    answer:
      "Ja, vi dækker hele området omkring Gentofte og planlægger ruter og opgaver samlet."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning Gentofte | Hvad koster det? | Få pris",
  description:
    "Hvad koster gulvafslibning i Gentofte? Få en hurtig prisvurdering og et gratis tilbud på dit gulv fra et professionelt gulvfirma.",
  path: "/gulvafslibning-gentofte"
});

export default function GulvGentoftePage() {
  return (
    <CityServicePage category="gulv">
      <CityImageHero backgroundImage="/media/featured%3Agulv/2.JPG">
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
      </CityImageHero>

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sådan planlægger vi gulvafslibning i Gentofte</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          I Gentofte ser vi ofte parket- og plankegulve, hvor finish og detaljegrad betyder meget for
          helhedsindtrykket – især i stue, gang og rum med høj daglig brug. Vi starter med at vurdere
          gulvtype og tilstand og ser særligt på slidzoner, ujævn glans og ridser i de mest
          trafikerede områder. Derefter planlægger vi forløbet efter adgang, parkering og
          rumfordeling, så du får en realistisk tidsplan og et resultat der bliver ensartet på tværs
          af rummene. Målet er en proces uden overraskelser og en løsning, der holder i hverdagen.
        </p>
      </section>

      <ReferenceStrip />

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="city-gulv-example-heading text-2xl font-semibold text-foreground">Eksempel på opgave i området</h2>
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

      <section className="city-grid-cards grid gap-6 md:grid-cols-2">
        <article className="city-surface city-surface--panel rounded-[28px] p-6">
          <h2 className="city-gulv-services-heading text-2xl font-semibold text-foreground">Hvad vi hjælper med</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Gulvslibning og opfriskning</li>
            <li>Afhøvling ved dybe skader</li>
            <li>Lak, olie eller sæbebehandling</li>
            <li>Udbedring af ridser og pletter</li>
          </ul>
        </article>
        <article className="city-surface city-surface--panel rounded-[28px] p-6">
          <h2 className="city-gulv-price-heading text-2xl font-semibold text-foreground">Pris</h2>
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

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder vi dækker</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Hellerup, Charlottenlund, Klampenborg, Ordrup, Jægersborg, Dyssegård, Vangede, Gentofte,
          Lyngby (nært).
        </p>
      </section>

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Finishvalg i praksis: lak, olie eller sæbe</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Finish handler ikke kun om udseende, men om hvordan gulvet fungerer i drift. Lak er typisk
          det mest slidstærke valg og ofte det mest praktiske i travle hjem – især i gangarealer og
          opholdsrum med høj trafik. Olie giver et mere naturligt udtryk og kan være en flot løsning,
          men kræver typisk mere løbende vedligehold. Sæbe giver et lyst og mat look, men stiller
          højere krav til korrekt rengøring og pleje for at holde sig pænt. Vi rådgiver ud fra dine
          rum og dit brug, så du vælger en løsning der både ser godt ud og er realistisk at
          vedligeholde.
        </p>
      </section>

      <FaqSection
        items={faqItems}
        title="Ofte stillede spørgsmål om gulvafslibning"
        intro="Svarene her giver et hurtigt overblik før du booker tilbudstid."
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </CityServicePage>
  );
}
