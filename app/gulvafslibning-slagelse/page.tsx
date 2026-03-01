import Link from "next/link";

import { ReferenceStrip } from "@/components/ReferenceStrip";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
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
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning i Slagelse | Uforpligtende tilbud | BP Slib",
  description:
    "Gulvafslibning i Slagelse, Korsør og Skælskør. Uforpligtende tilbud baseret på gulvtype, m² og finish. Erhvervserfaring fra bl.a. Rigshospitalets Patienthotel og Tivoli. Book tilbudstid.",
  path: "/gulvafslibning-slagelse"
});

export default function GulvSlagelsePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
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
      </section>

      <ReferenceStrip />

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Eksempel på opgave i området</h2>
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
          Slagelse, Korsør, Skælskør, Sorø (nært), Dianalund (nært), Fuglebjerg (nært), Dalmose.
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
