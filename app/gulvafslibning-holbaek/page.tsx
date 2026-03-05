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
    question: "Kan I slibe flere rum på én gang?",
    answer:
      "Ja - det er ofte smartest. Vi planlægger rækkefølgen, så det fungerer praktisk med adgang og tørring."
  },
  {
    question: "Hvad hvis gulvet er meget ujævnt eller har dybe hak?",
    answer:
      "Så kan afhøvling eller ekstra forarbejde være nødvendigt. Det vurderer vi på tilbudstiden."
  },
  {
    question: "Hvad koster det?",
    answer:
      "Det afhænger af m², gulvtype, tilstand og efterbehandling. Du får et konkret tilbud efter vurdering."
  },
  {
    question: "Skal vi være hjemme under arbejdet?",
    answer:
      "Det kommer an på adgang. Mange vælger at være væk i arbejdstiden - vi aftaler det praktiske på forhånd."
  },
  {
    question: "Kan I hjælpe i Tuse/Vipperød/Jyderup?",
    answer:
      "Ja - vi dækker hele området og planlægger ruter og opgaver samlet."
  },
  {
    question: "Hvilken finish er mest \"nem\"?",
    answer:
      "Lak er typisk nemmest i drift. Olie og sæbe giver flotte udtryk, men kræver mere løbende pleje."
  },
  {
    question: "Kan I slibe flere rum på én gang?",
    answer:
      "Ja. Det er ofte smartest at tage flere rum samlet, men vi kan også planlægge i etaper hvis det passer bedre til din hverdag og tørretider."
  },
  {
    question: "Hvad hvis gulvet er meget ujævnt eller har dybe hak?",
    answer:
      "Så kan der være behov for ekstra forarbejde eller afhøvling. Det vurderer vi på tilbudstiden, når vi har set gulvtype og tilstand."
  },
  {
    question: "Hvilken finish er lettest at vedligeholde?",
    answer:
      "Lak er typisk lettest i drift. Olie og sæbe kan give flotte udtryk, men kræver mere løbende pleje."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning Holbæk | Pris på gulvslibning | Gratis tilbud",
  description:
    "Se hvad gulvafslibning typisk koster og få et gratis tilbud på dit gulv i Holbæk. Professionel slibning af trægulve.",
  path: "/gulvafslibning-holbaek"
});

export default function GulvHolbaekPage() {
  return (
    <CityServicePage category="gulv">
      <CityImageHero backgroundImage="/media/featured%3Agulv/feature.2.jpeg">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvafslibning i Holbæk
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi hjælper med gulvafslibning i Holbæk og omegn - både i helårshuse og boliger, hvor
          gulvene har taget imod mange års slid. Nøglen til et flot resultat er korrekt vurdering af
          gulvets tilstand, gulvtype og den finish, der passer til din hverdag.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Du får et uforpligtende tilbud baseret på m², tilstand og ønsket efterbehandling (lak, olie
          eller sæbe). Vi afklarer adgang og praktiske forhold, så du får en realistisk plan og et
          forløb uden overraskelser.
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
        <h2 className="text-2xl font-semibold text-foreground">
          Sådan planlægger vi gulvafslibning i Holbæk
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          I Holbæk og omegn ser vi ofte opgaver, hvor gulvet har taget imod mange års hverdagsbrug
          – især i stue, gang og rum med høj trafik. Vi starter med at vurdere gulvtype (parket,
          plank eller sildeben), tilstand og slidlag, så vi kan vælge den rigtige proces uden
          overraskelser. Derefter planlægger vi rækkefølge og tidsplan, så det passer til din
          hverdag – og vi afklarer praktiske forhold som adgang, parkering og om opgaven med fordel
          kan tages i etaper ved flere rum. Målet er et ensartet resultat og en finish der holder i
          praksis.
        </p>
      </section>

      <ReferenceStrip />

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="city-gulv-example-heading text-2xl font-semibold text-foreground">Eksempel på opgave i området</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">Udgangspunkt:</span> Plankegulv med synlige ridser, slidfelter og ujævn glans.
          </li>
          <li>
            <span className="font-semibold text-foreground">Løsning:</span> Slibning i trin + finishvalg ud fra brug (lak ved høj slid, olie ved naturligt look).
          </li>
          <li>
            <span className="font-semibold text-foreground">Resultat:</span> Ensartet overflade og et gulv der er nemmere at vedligeholde.
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
          Holbæk, Tuse, Vipperød, Svinninge, Jyderup, Mørkøv, Kalundborg (nært).
        </p>
      </section>

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Finishvalg i praksis: lak, olie eller sæbe
        </h2>
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
