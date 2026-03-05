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
  },
  {
    question: "Kan I slibe gulv i lejlighed i Roskilde uden at det bliver kaos?",
    answer:
      "Ja. Vi planlægger efter adgang, opgang og tidsvinduer og bruger støvkontrol og afdækning. Der vil altid være noget støv ved slibning, men vi gør det så kontrolleret som muligt."
  },
  {
    question: "Hvilken finish anbefaler I til en travl hverdag?",
    answer:
      "Ofte lak, fordi det er mest slidstærkt og typisk nemmest i drift. Olie og sæbe kan være flotte valg, men kræver mere løbende pleje."
  },
  {
    question: "Hvor lang tid tager gulvafslibning typisk?",
    answer:
      "Det afhænger af m², gulvtype og efterbehandling. Du får en realistisk tidsplan, når vi har vurderet opgaven."
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
    <CityServicePage category="gulv">
      <CityImageHero backgroundImage="/media/featured%3Agulv/2.JPG">
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
      </CityImageHero>

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sådan planlægger vi gulvafslibning i Roskilde</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Roskilde rummer både lejligheder tæt på centrum og områder som Trekroner, hvor adgang og
          praktisk plan ofte er enklere. Derfor starter vi med at afklare gulvtype (parket, plank
          eller sildeben), tilstand og hvordan rummene bliver brugt i hverdagen. Vi planlægger
          derefter rækkefølge og tidsplan, så du ved hvad der sker hvornår – og vi afklarer på
          forhånd de praktiske ting som parkering, adgang og om der er særlige tidsvinduer. Målet er
          et forløb uden overraskelser og et resultat med ensartet udtryk og god holdbarhed.
        </p>
      </section>

      <ReferenceStrip />

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="city-gulv-example-heading text-2xl font-semibold text-foreground">Eksempel på opgave i området</h2>
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
          Roskilde, Trekroner, Svogerslev, Veddelev, Viby Sjælland, Gadstrup, Jyllinge, Lejre (nært).
        </p>
      </section>

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Finishvalg i praksis: lak, olie eller sæbe</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Finish handler ikke kun om udseende – det handler om drift i hverdagen. Lak er typisk det
          mest slidstærke valg og ofte det mest praktiske i rum med høj trafik som gang og
          opholdsrum. Olie giver et mere naturligt udtryk og kan være en flot løsning, men kræver
          typisk mere løbende vedligehold. Sæbe giver et lyst og mat look, men stiller højere krav
          til korrekt rengøring og pleje for at holde sig pænt. Vi rådgiver ud fra dine rum og dit
          brug, så du vælger en løsning der både ser godt ud og fungerer i praksis.
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
