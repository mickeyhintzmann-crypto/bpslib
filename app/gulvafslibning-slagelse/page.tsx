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
    question: "Kan I lave en løsning, der passer til en stram tidsplan?",
    answer:
      "Ja - vi planlægger realistisk og afklarer alt tidligt. Fortæl os dine deadlines ved booking."
  },
  {
    question: "Hvad hvis der er mange rum eller stort areal?",
    answer:
      "Så planlægger vi arbejdet i etaper og hjælper dig med at vælge finish, der passer til drift og slid."
  },
  {
    question: "Hvad koster det?",
    answer:
      "Det afhænger af gulvtype, m², tilstand og efterbehandling. Book tilbudstid, så får du et konkret tilbud."
  },
  {
    question: "Hvilken finish anbefaler I til gang/entre?",
    answer:
      "Typisk lak pga. slidstyrke. Vi rådgiver ud fra din brug."
  },
  {
    question: "Støver det meget?",
    answer:
      "Vi bruger støvkontrol og afdækning, men der vil altid være noget støv ved slibning."
  },
  {
    question: "Dækker I også Korsør/Skælskør/Sorø?",
    answer:
      "Ja - vi dækker hele området og planlægger ruter samlet."
  },
  {
    question: "Kan I planlægge efter en stram tidsplan eller deadline?",
    answer:
      "Ja. Fortæl os dine deadlines ved booking, så planlægger vi forløbet så realistisk som muligt – evt. i etaper ved større arealer."
  },
  {
    question: "Hvad hvis der er mange rum eller et stort areal?",
    answer:
      "Så planlægger vi rækkefølge og etaper, så det fungerer praktisk med adgang og tørretider. Du får en klar plan og forventningsafstemning."
  },
  {
    question: "Hvilken finish anbefaler I til gang og rum med høj trafik?",
    answer:
      "Typisk lak pga. slidstyrke og nem vedligehold. Olie og sæbe kan være flotte valg, men kræver mere pleje."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning Slagelse | Få pris på dit trægulv",
  description:
    "Vi tilbyder professionel gulvafslibning i Slagelse. Få en pris på dit trægulv og et uforpligtende tilbud.",
  path: "/gulvafslibning-slagelse"
});

export default function GulvSlagelsePage() {
  return (
    <CityServicePage category="gulv">
      <CityImageHero backgroundImage="/media/featured%3Agulv/2.JPG">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvafslibning i Slagelse
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi hjælper med gulvafslibning i Slagelse og omegn - både i villaer, rækkehuse og større
          arealer, hvor planlægning og tidsplan betyder meget. Vi tilpasser forløbet efter gulvtype,
          tilstand og praktiske forhold, så du får en tydelig proces og et resultat, der holder.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Du får et uforpligtende tilbud baseret på m², gulvtype og ønsket behandling (lak, olie eller
          sæbe). Vi afklarer adgang, parkering og tidsplan tidligt, så du undgår overraskelser.
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
        <h2 className="text-2xl font-semibold text-foreground">
          Sådan planlægger vi gulvafslibning i Slagelse
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          I Slagelse og omegn ser vi ofte opgaver med flere rum eller større opholdsarealer, hvor en tydelig plan gør hele processen lettere. Vi starter med at vurdere gulvtype (parket, plank eller sildeben), tilstand og hvor de mest slidte zoner er – typisk i gang, stue og alrum. Derefter planlægger vi rækkefølge, adgang og tidsplan, så du ved hvad der sker hvornår, og så det fungerer praktisk med tørretider og hverdagen. Målet er en proces uden overraskelser og et ensartet resultat med en finish der passer til brugen.
        </p>
      </section>

      <ReferenceStrip />

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="city-gulv-example-heading text-2xl font-semibold text-foreground">Eksempel på opgave i området</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">Udgangspunkt:</span> Slidt gulv i stue/gang med ridser og tydelige slidspor.
          </li>
          <li>
            <span className="font-semibold text-foreground">Løsning:</span> Kontrolleret slibning + finishvalg, der passer til brug (ofte lak ved høj trafik).
          </li>
          <li>
            <span className="font-semibold text-foreground">Resultat:</span> Pænere overflade, mere ensartet udtryk og bedre modstand i hverdagen.
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
          Slagelse, Korsør, Skælskør, Sorø (nært), Dianalund (nært), Fuglebjerg (nært), Dalmose.
        </p>
      </section>

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Finishvalg i praksis: lak, olie eller sæbe
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Finish handler ikke kun om udseende – det handler om drift i hverdagen. Lak er typisk det mest slidstærke valg og ofte det mest praktiske i rum med høj trafik som gang og opholdsrum. Olie giver et mere naturligt udtryk og kan være en flot løsning, men kræver typisk mere løbende vedligehold. Sæbe giver et lyst og mat look, men stiller højere krav til korrekt rengøring og pleje for at holde sig pænt. Vi rådgiver ud fra dine rum og dit brug, så du vælger en løsning der både ser godt ud og fungerer i praksis.
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
