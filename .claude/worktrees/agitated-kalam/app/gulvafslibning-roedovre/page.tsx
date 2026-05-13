import Link from "next/link";

import { CityImageHero } from "@/components/layouts/CityImageHero";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { CityServicePage } from "@/components/layouts/CityServicePage";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvad koster gulvafslibning i Rødovre?",
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
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning i Rødovre | Uforpligtende tilbud | BPSLIB",
  description: "Gulvafslibning i Rødovre. Book uforpligtende tilbudstid eller kontakt os.",
  path: "/gulvafslibning-roedovre"
});

export default function GulvRoedovrePage() {
  return (
    <CityServicePage category="gulv">
      <CityImageHero backgroundImage="/media/featured%3Agulv/feature.2.jpeg">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Gulvafslibning i Rødovre
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi hjælper med gulvafslibning i Rødovre. Du får et uforpligtende tilbud baseret på gulvtype, areal og ønsket behandling. Området har mange rækkehuse og
          villaer, og vi tilpasser forløbet efter adgang og praktiske forhold. Vi kører også i{" "}
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
            <p className="mt-2 text-sm leading-relaxed text-foreground">Slidt gulv med ridser og ujævn glans i bolig.</p>
          </article>
          <article className="rounded-2xl border border-border/70 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Løsning</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">Slibning i trin og ny finish efter ønsket udtryk.</p>
          </article>
          <article className="rounded-2xl border border-border/70 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Resultat</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">Jævnt gulv med roligt udtryk og bedre holdbarhed.</p>
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
          Rødovre, Islev, Valby (nært), Vanløse (nært), Hvidovre, Brøndby, Glostrup, Herlev.
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
