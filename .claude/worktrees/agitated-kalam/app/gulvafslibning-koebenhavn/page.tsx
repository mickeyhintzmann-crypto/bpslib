import Link from "next/link";

import { CityImageHero } from "@/components/layouts/CityImageHero";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { CityServicePage } from "@/components/layouts/CityServicePage";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvad koster gulvafslibning i København?",
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
    question: "Hvordan booker jeg tilbudstid?",
    answer:
      "Du booker uforpligtende tilbudstid via formularen, så vender vi hurtigt tilbage."
  },
  {
    question: "Kan I planlægge efter ejerforeningens regler og tidsrum?",
    answer:
      "Ja. Fortæl os regler for støj/tidsvinduer og adgang, så tilpasser vi forløbet og planlægger realistisk."
  },
  {
    question: "Hvilken finish anbefaler I til gang og høj trafik?",
    answer:
      "Typisk lak pga. slidstyrke og nem vedligehold. Olie og sæbe kan være flotte valg, men kræver mere pleje."
  },
  {
    question: "Skal vi flytte alle møbler ud af rummet?",
    answer:
      "Som udgangspunkt ja i slibeområdet. Tunge møbler aftales, så vi kan planlægge korrekt og undgå overraskelser."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning i København | Uforpligtende tilbud | BPSLIB",
  description:
    "Gulvafslibning i København. Book uforpligtende tilbudstid eller kontakt os. Vi kører på hele Sjælland.",
  path: "/gulvafslibning-koebenhavn"
});

export default function GulvKoebenhavnPage() {
  return (
    <CityServicePage category="gulv">
      <CityImageHero backgroundImage="/media/featured%3Agulv/feature.2.jpeg">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvafslibning i København
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi hjælper med gulvafslibning i København. Du får et uforpligtende tilbud baseret på gulvtype, areal og ønsket behandling. I lejligheder og etageejendomme
          er adgang, støvkontrol og planlægning vigtige, og vi tilrettelægger opgaven så det passer til
          hverdagen. Vi kører
          også i{" "}
          <Link href="/gulvafslibning-koebenhavn-omegn" className="font-medium text-foreground hover:text-primary">
            København og omegn
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

      <section className="mt-8 overflow-hidden rounded-[30px] border border-border/70 bg-[linear-gradient(145deg,hsl(36_55%_97%),hsl(0_0%_100%))] shadow-[0_20px_44px_hsl(24_24%_18%/0.08)]">
        <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1.3fr_0.7fr] lg:gap-8">
          <div>
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              Planlagning
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-foreground">
              Sådan planlægger vi gulvafslibning i København
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              I København er planlægning ofte nøglen til et smidigt forløb – især i lejligheder og etageejendomme.
              Vi afklarer adgang via opgang/elevator, tidsvinduer og parkering, før vi går i gang, så du får en
              realistisk plan og færre overraskelser. Vi vurderer gulvtype (parket, plank eller sildeben), slidlag og
              hvor slidt gulvet er i gang- og opholdsrum, så vi kan anbefale en proces og finish der passer til din
              hverdag. Målet er en effektiv udførelse, tydelig tidsplan og et ensartet resultat.
            </p>
          </div>
          <aside className="grid gap-3 self-start rounded-2xl border border-border/70 bg-white/85 p-4 md:p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">Vi afklarer altid</h3>
            <p className="rounded-xl border border-border/70 bg-white px-3 py-2 text-sm text-foreground">Adgang og opgang/elevator</p>
            <p className="rounded-xl border border-border/70 bg-white px-3 py-2 text-sm text-foreground">Tidsvinduer og parkering</p>
            <p className="rounded-xl border border-border/70 bg-white px-3 py-2 text-sm text-foreground">Gulvtype, slidlag og finish</p>
          </aside>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[30px] border border-border/70 bg-[linear-gradient(145deg,hsl(34_60%_98%),hsl(0_0%_100%))] p-6 shadow-[0_20px_44px_hsl(24_24%_18%/0.08)] md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="city-gulv-example-heading text-2xl font-semibold text-foreground">Eksempel på opgave i området</h2>
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Før → under → efter
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-border/70 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Problem</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">Slidt plankegulv i københavnerlejlighed med ridser og matte felter.</p>
          </article>
          <article className="rounded-2xl border border-border/70 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Løsning</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">Kontrolleret slibning med støvkontrol og ny finish.</p>
          </article>
          <article className="rounded-2xl border border-border/70 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Resultat</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">Ensartet overflade med roligt udtryk og bedre hverdagsstyrke.</p>
          </article>
        </div>
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
          Indre By, Østerbro, Nørrebro, Vesterbro, Valby, Vanløse, Brønshøj, Amagerbro, Sydhavn,
          Nordhavn, Christianshavn.
        </p>
      </section>

      <section className="mt-8 city-surface city-surface--panel rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Finishvalg i praksis: lak, olie eller sæbe
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          I København vælger mange lak i gangarealer og køkken/alrum, fordi det typisk er den mest slidstærke løsning og nemmest i daglig drift. Olie giver et mere naturligt udtryk og kan være en flot løsning i stuer, men kræver typisk mere løbende vedligehold. Sæbe giver et lyst og mat look, men stiller højere krav til korrekt rengøring og pleje for at holde sig pænt. Vi rådgiver ud fra dine rum og dit brug, så du vælger en løsning der både ser godt ud og fungerer i praksis.
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
