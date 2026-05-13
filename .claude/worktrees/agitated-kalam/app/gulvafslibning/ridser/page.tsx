import Link from "next/link";

import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Kan alle ridser slibes væk?",
    answer:
      "Mange ridser kan fjernes med korrekt slibning, men meget dybe skader kræver en grundigere vurdering."
  },
  {
    question: "Hvornår er afhøvling nødvendig?",
    answer:
      "Afhøvling kan være relevant ved meget dybe skader eller ujævnheder. Vi vurderer det i tilbuddet."
  },
  {
    question: "Skal hele gulvet slibes?",
    answer:
      "Ofte giver en samlet slibning det pæneste resultat, især hvis der er flere ridser eller ujævn glans."
  },
  {
    question: "Hvor lang tid tager det?",
    answer:
      "Tiden afhænger af areal og behandling. Vi giver en realistisk tidsplan, når vi har set opgaven."
  },
  {
    question: "Støver det meget?",
    answer:
      "Vi bruger støvkontrol og afdækning, men der vil altid være noget støv ved gulvafslibning."
  },
  {
    question: "Hvordan booker jeg tilbudstid?",
    answer:
      "Du booker uforpligtende tilbudstid via formularen, så vender vi hurtigt tilbage."
  }
];

export const metadata = buildMetadata({
  title: "Ridser i trægulv? Sådan får du det flot igen | BPSLIB",
  description:
    "Ridser i gulvet kan ofte slibes væk. Book uforpligtende tilbudstid eller kontakt os. Vi kører på hele Sjælland.",
  path: "/gulvafslibning/ridser"
});

export default function GulvRidserPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Ridser i trægulv – løsninger og hvad der kan reddes
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Ridser i trægulve opstår ofte ved daglig brug, flytning af møbler eller slid gennem mange år.
          I de fleste tilfælde kan ridser slibes væk, og gulvet kan få et ensartet udtryk igen. Vi
          hjælper med vurdering og forslag til behandling på hele Sjælland. Se også vores oversigt
          for{" "}
          <Link href="/gulvafslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            gulvafslibning på Sjælland
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
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvad afgør om ridser kan fjernes?</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Dybden på ridserne og om de går ned i træet</li>
          <li>Gulvtype og træsort</li>
          <li>Tidligere behandlinger som lak, olie eller sæbe</li>
        </ul>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Sådan løser vi det</h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1. Vurdering af ridser og gulvets tilstand</li>
            <li>2. Slibning og klargøring af overfladen</li>
            <li>3. Ny behandling efter ønsket finish</li>
          </ol>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Efterbehandling</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Efter slibning vælger vi den finish, der passer til gulvets brug. Du kan vælge mellem{" "}
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
            . Vi rådgiver om det bedste valg ud fra rum og belastning.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Pris</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen afhænger af areal, gulvtype og behandling. Se vores{" "}
          <Link href="/gulvafslibning/pris" className="font-medium text-foreground hover:text-primary">
            pris-side
          </Link>
          , og få et uforpligtende tilbud efter tilbudstid.
        </p>
      </section>

      <FaqSection
        items={faqItems}
        title="Ofte stillede spørgsmål om ridser i gulv"
        intro="Svarene her giver et hurtigt overblik før du booker tilbudstid."
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
