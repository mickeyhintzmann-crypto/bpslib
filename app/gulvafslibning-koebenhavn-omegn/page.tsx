import Link from "next/link";

import { CityImageHero } from "@/components/layouts/CityImageHero";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { CityServicePage } from "@/components/layouts/CityServicePage";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvad koster gulvafslibning?",
    answer:
      "Prisen afhænger af gulvtype, areal og behandling. Send en kort beskrivelse, så får du et tilbud."
  },
  {
    question: "Hvornår vælger man afhøvling?",
    answer:
      "Afhøvling bruges når gulvet er meget ujævnt eller har dybe skader, der ikke kan slibes væk."
  },
  {
    question: "Lak eller olie?",
    answer:
      "Lak giver en robust overflade, olie giver et mere naturligt udtryk. Vi rådgiver ud fra brug og ønsket finish."
  },
  {
    question: "Hvor lang tid tager det?",
    answer:
      "Tiden afhænger af opgavens størrelse og behandling. Vi giver en realistisk tidsplan i tilbuddet."
  },
  {
    question: "Støver det meget?",
    answer:
      "Vi bruger støvkontrol og afdækning, men der vil altid være noget støv ved gulvslibning."
  },
  {
    question: "Kører I i hele København og omegn?",
    answer:
      "Ja, vi dækker København og omegn og planlægger ruter, så tiderne er stabile."
  },
  {
    question: "Dækker I både lejligheder og villaer i København og omegn?",
    answer:
      "Ja. Vi planlægger efter adgang og praktiske forhold og tilpasser forløbet efter boligen og rummenes brug."
  },
  {
    question: "Kan I tage flere rum i samme opgave?",
    answer:
      "Ja. Vi planlægger rækkefølge og eventuelle etaper, så det fungerer praktisk med adgang og tørretider."
  },
  {
    question: "Hvilken finish er mest vedligeholdelsesnem?",
    answer:
      "Lak er typisk nemmest i drift. Olie og sæbe kan give flotte udtryk, men kræver mere løbende pleje."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning i København & omegn | Uforpligtende tilbud | BPSLIB",
  description:
    "Gulvafslibning i København og omegn. Book uforpligtende tilbudstid eller kontakt os. Vi kører på hele Sjælland.",
  path: "/gulvafslibning-koebenhavn-omegn"
});

export default function GulvKoebenhavnOmegnPage() {
  return (
    <CityServicePage category="gulv">
      <CityImageHero backgroundImage="/media/featured%3Agulv/2.JPG">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvafslibning i København & omegn
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi hjælper med gulvafslibning i København og omegn. Du får et uforpligtende tilbud baseret på gulvtype, areal og ønsket behandling. Vi planlægger stabilt og kører på hele{" "}
          <Link href="/gulvafslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            Sjælland
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
      </CityImageHero>

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Planlægning og proces i København og omegn</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          I København og omegn varierer opgaverne fra lejligheder med opgang/elevator til villaer, hvor adgang ofte er enklere – og derfor starter vi altid med planlægningen. Vi afklarer gulvtype (parket, plank eller sildeben), tilstand og hvilke rum der er mest belastede, så proces og finish passer til brugen. Samtidig afklarer vi adgang, parkering og tidsvinduer, så du får en realistisk plan og en proces uden overraskelser. Målet er et ensartet resultat og en tidsplan der holder, uanset om opgaven er én stue eller flere rum.
        </p>
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
          <h2 className="text-2xl font-semibold text-foreground">Sådan foregår det</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>1. Send en kort beskrivelse via tilbudstid.</li>
            <li>2. Vi afklarer opgaven og anbefaler behandling.</li>
            <li>3. Du får et tilbud og en konkret tidsplan.</li>
          </ol>
        </article>
      </section>

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
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
      </section>

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder vi dækker</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          København, Frederiksberg, Østerbro, Nørrebro, Vesterbro, Valby, Vanløse, Amager, Hvidovre,
          Rødovre, Gentofte, Lyngby.
        </p>
      </section>

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Efterbehandling der passer til brug</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Lak er typisk det mest slidstærke valg og ofte det mest praktiske i drift – især i gangarealer og travle hjem. Olie giver et mere naturligt udtryk og kan være en flot løsning, men kræver typisk mere løbende vedligehold. Sæbe giver et lyst og mat look, men stiller højere krav til korrekt rengøring og pleje for at holde sig pænt. Vi rådgiver ud fra dit gulv og din hverdag, så du vælger en løsning der både ser godt ud og fungerer i praksis.
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
