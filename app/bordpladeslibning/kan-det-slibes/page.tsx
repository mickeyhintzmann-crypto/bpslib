import Link from "next/link";

import { CtaRow } from "@/components/bordplade/CtaRow";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { InternalLinkGrid } from "@/components/bordplade/InternalLinkGrid";
import { PageHero } from "@/components/bordplade/PageHero";
import {
  StructuredData,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvordan ser jeg forskel på massiv træ og finer?",
    answer:
      "Kig på kanten: massiv træ viser gennemgående struktur, mens finer ofte har tyndt toplag over andet materiale."
  },
  {
    question: "Kan laminat slibes?",
    answer:
      "Som udgangspunkt nej. Laminat har ikke et massivt toplag der tåler almindelig afslibning."
  },
  {
    question: "Hvad hvis jeg er i tvivl om materialet?",
    answer:
      "Upload et tydeligt kantbillede i prisberegneren, så afklarer vi det hurtigt før du booker."
  },
  {
    question: "Kan finer reddes med let slibning?",
    answer:
      "Risikoen for gennems libning er høj. Vi anbefaler altid afklaring før enhver behandling."
  },
  {
    question: "Tager I stadig opgaven hvis den ikke er massiv?",
    answer:
      "Vi sliber kun massiv træ, men vi henviser venligt til tilbudstid eller kontakt for alternativer."
  },
  {
    question: "Koster afklaringen noget?",
    answer:
      "Nej, den indledende billedafklaring er en del af vores normale vurdering."
  },
  {
    question: "Hvilke billeder skal jeg sende?",
    answer:
      "Send 3–6 billeder af overfladen og mindst ét tydeligt billede af kanten eller endetræet."
  },
  {
    question: "Hvordan tager jeg et godt kantbillede?",
    answer:
      "Stil dig tæt på kanten i dagslys og tag billedet lige på (ikke skråt). Hvis kanten er mørk, så tag også et billede uden blitz og et med blitz, så strukturen bliver tydelig."
  },
  {
    question: "Hvad hvis kanten er dækket af en liste eller aluprofil?",
    answer:
      "Send et billede ved en udskæring (vask/kogeplade) eller undersiden, hvor man ofte kan se opbygningen bedre. Vi siger til, hvis vi mangler en bestemt vinkel."
  },
  {
    question: "Kan en massiv bordplade være “for tynd” til slibning?",
    answer:
      "Sjældent, men det afhænger af historik og hvor meget der tidligere er slebet af. Vi vurderer det ud fra bordpladens stand og kanter."
  },
  {
    question: "Hvad med stavlimede bordplader – er de massive?",
    answer:
      "Ja, stavlimede bordplader er typisk massiv træ (opbygget af stave). De kan ofte slibes, men vi vurderer altid skader og tidligere behandling først."
  },
  {
    question: "Kan man nøjes med at slibe et lille område?",
    answer:
      "Nogle gange, men det kan give synlige overgange i farve og glans. Hvis målet er et ensartet resultat, anbefaler vi ofte en samlet slibning og ny finish."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Kan bordpladen slibes?",
  description:
    "Afklaring af om bordplader er massiv træ, finer eller laminat, samt anbefalet næste skridt før behandling.",
  url: "https://bpslib.dk/bordpladeslibning/kan-det-slibes"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning på Sjælland",
    item: "https://bpslib.dk/bordpladeslibning-sjaelland"
  },
  {
    name: "Kan det slibes?",
    item: "https://bpslib.dk/bordpladeslibning/kan-det-slibes"
  }
]);

export const metadata = buildMetadata({
  title: "Kan bordpladen slibes?",
  description:
    "Se hvordan du afgør om bordpladen er massiv træ, finer eller laminat. Upload kantbillede og få hurtig afklaring.",
  path: "/bordpladeslibning/kan-det-slibes"
});

export default function KanDetSlibesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <PageHero
        eyebrow="Materialeafklaring"
        title="Kan din bordplade slibes?"
        intro="Vi sliber kun massiv træ. Her får du en enkel måde at afklare materiale hurtigt, så du undgår at bruge tid og budget på en forkert løsning."
      />

      <section className="grid gap-6 py-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Massiv træ vs. finer/laminat</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Massiv træ:</span> træstruktur går typisk
              gennem hele kanten, og mønsteret virker ikke som et tyndt toplag.
            </p>
            <p>
              <span className="font-semibold text-foreground">Finér:</span> tyndt ægte trælag ovenpå en
              kerne. Risiko for gennems libning ved behandling.
            </p>
            <p>
              <span className="font-semibold text-foreground">Laminat:</span> kunstig overflade uden
              slibebart massivt lag.
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Sådan afklarer vi hurtigt</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Upload et kantbillede sammen med 3–6 billeder af overfladen. Vi giver hurtig besked om
            bordpladen er egnet til slibning, og hvad næste skridt er.
          </p>
          <div className="mt-5">
            <CtaRow primaryLabel="Upload og få afklaring" />
          </div>
        </article>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">
          60-sekunders tjek: sådan kan du ofte se materialet selv
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Hvis du vil have en hurtig fornemmelse, kan du ofte komme langt med et par enkle
          observationer. Du behøver ikke være ekspert — du skal bare kigge de rigtige steder.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>
            Kig på kanten: Ved massiv træ virker strukturen “dyb” og sammenhængende, ikke som et
            tyndt lag ovenpå noget andet.
          </li>
          <li>
            Kig ved udskæringer: Ved vask/kogeplade kan man nogle gange ane lag-opbygning, hvis det
            er finér/laminat.
          </li>
          <li>
            Se på enden (endetræ): Endetræ er ofte den tydeligste indikator, hvis du kan få et
            billede af det.
          </li>
          <li>
            Undersiden: På nogle bordplader afslører undersiden materialet tydeligere end
            oversiden.
          </li>
          <li>
            Gentagelser i mønster: Laminat kan have et “printet” udtryk, hvor mønsteret gentager
            sig eller virker overfladisk.
          </li>
        </ul>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">
          Tegn på finér og laminat (og hvorfor slibning kan være risikabelt)
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Finér og laminat kan se flotte ud, men de er typisk ikke bygget til klassisk slibning. Når
          man sliber i et tyndt toplag, kan man komme igennem overfladen, og så kan bordpladen ikke
          “rettes op” igen med finish. Derfor handler det først og fremmest om at undgå en forkert
          proces.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>
            Finér: kan have et meget tyndt toplag — dybe skjolder/ridser kan ikke fjernes uden
            risiko.
          </li>
          <li>
            Laminat: har ikke et slibebart trælag og tåler som udgangspunkt ikke afslibning.
          </li>
          <li>
            Kanter og hjørner: er ofte de mest udsatte steder, hvis man forsøger at slibe et tyndt
            lag.
          </li>
        </ul>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">
          Hvis den er massiv: hvad kan du typisk få ud af slibning?
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Når bordpladen er massiv træ, kan slibning ofte “nulstille” overfladen og gøre den ens
          igen. Det betyder ikke, at alt altid forsvinder 100% — dybe skader kan kræve mere arbejde
          — men i mange tilfælde kan både udtryk og funktion forbedres markant med den rigtige
          tilgang og finish.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>Skjolder og matte felter kan ofte fjernes eller reduceres betydeligt</li>
          <li>Fine ridser kan typisk slibes væk, så overfladen bliver jævn igen</li>
          <li>Varmepletter kan nogle gange reduceres (afhænger af dybde og trætype)</li>
          <li>Ny finish kan gøre bordpladen mere praktisk i drift (valg afhænger af brug)</li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi vurderer altid dybde og tidligere behandling før vi anbefaler den bedste løsning.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Billeder der giver et sikkert svar (så vi ikke gætter)
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Det er helt normalt at være i tvivl. Det vi har brug for, er billeder der viser både
          helhed og detaljer i godt lys. Så kan vi typisk afklare materialet hurtigt og pege dig i
          den rigtige retning.
        </p>
        <p className="mt-3 text-sm font-semibold text-foreground">Send gerne disse billeder:</p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>1 helhed: hele bordpladen set oppefra</li>
          <li>2 nærbilleder: overfladen i dagslys (uden blitz hvis muligt)</li>
          <li>1 fokus: værste skade (skjold/ridse/varmeplet)</li>
          <li>1 kant/ende: tydeligt billede af kanten eller endetræ (meget vigtigt)</li>
          <li>(Valgfrit) et billede ved vask/kogeplade, hvis der er udskæring</li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Hvis du vil have en hurtig afklaring, er det nemmest at uploade billeder via
          prisberegneren — så svarer vi med næste skridt.
        </p>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/prisberegner">Gå til prisberegner</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvis bordpladen ikke er massiv</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Hvis materialet ikke er massivt træ, hjælper vi dig videre på en ordentlig måde. Du kan
          sende opgaven via tilbudstid eller kontakte os direkte for en alternativ løsning.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/tilbudstid">Gå til tilbudstid</Link>
          </Button>
          <Button asChild>
            <Link href="/kontakt">Kontakt os</Link>
          </Button>
        </div>
      </section>

      <InternalLinkGrid
        title="Relaterede sider"
        intro="Brug links her til pris, booking og de mest efterspurgte problem-sider."
        links={[
          { href: "/bordpladeslibning-sjaelland", label: "Bordpladeslibning på Sjælland" },
          { href: "/bordpladeslibning/pris", label: "Prisguide" },
          { href: "/bordpladeslibning/prisberegner", label: "Prisberegner" },
          { href: "/bordpladeslibning/book", label: "Book tid" },
          { href: "/bordpladeslibning/skjolder", label: "Skjolder" },
          { href: "/bordpladeslibning/ridser", label: "Ridser" },
          { href: "/akutte-tider", label: "Akutte tider" }
        ]}
      />

      <FaqSection
        items={faqItems}
        intro="Disse spørgsmål hjælper med hurtig afklaring, før du går videre til pris eller booking."
      />

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </main>
  );
}
