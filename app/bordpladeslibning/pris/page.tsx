import Link from "next/link";

import { CtaRow } from "@/components/bordplade/CtaRow";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { InternalLinkGrid } from "@/components/bordplade/InternalLinkGrid";
import { MiniCase } from "@/components/bordplade/MiniCase";
import { PageHero } from "@/components/bordplade/PageHero";
import {
  StructuredData,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

const priceExamples = [
  {
    title: "Lille/alm. køkkenbord (små mål)",
    range: "Ca. 3.000–4.000 kr.",
    note: "Små køkkener kan i enkelte tilfælde lande omkring 3.000 kr."
  },
  {
    title: "Stort køkken eller køkken med vandfald",
    range: "Ca. 4.000–5.000 kr.",
    note: "Køkkener ligger typisk her afhængigt af finish og tilstand."
  },
  {
    title: "Tillæg: Spisebord",
    range: "+1.200–2.200 kr.",
    note: "Tilvalg når spisebordet slibes sammen med køkkenet."
  },
  {
    title: "Tillæg: Sofabord",
    range: "+500–1.500 kr.",
    note: "Afhænger af størrelse og ønsket finish."
  },
  {
    title: "Tillæg: Bryggers",
    range: "+1.000–2.500 kr.",
    note: "Ekstra bordplader i bryggers eller lignende."
  },
  {
    title: "Tillæg: Vindueskarme",
    range: "+250–500 kr. pr. stk.",
    note: "Pris pr. karm afhænger af længde og tilstand."
  },
  {
    title: "Tillæg: Vandfald",
    range: "+600–900 kr. pr. stk.",
    note: "Antal og længde påvirker prisen."
  },
  {
    title: "Tillæg: Lister",
    range: "Pris efter aftale",
    note: "Oplys antal og længder i prisberegneren."
  }
];

const faqItems = [
  {
    question: "Hvad er inkluderet i prisen?",
    answer:
      "Slibning, almindelig klargøring, aftalt finish og kvalitetstjek er inkluderet i den oplyste pris."
  },
  {
    question: "Hvad kan påvirke prisen opad?",
    answer:
      "Dybe skader, vanskelig adgang, ekstra detaljearbejde og tidligere behandlinger kan øge tidsforbruget."
  },
  {
    question: "Hvordan vælger I antal slots?",
    answer:
      "Vi vurderer omfang og fordeler arbejdet i 1, 2 eller 3 slots for at sikre kvalitet uden hastværk."
  },
  {
    question: "Kan I give fast pris?",
    answer:
      "Ja, når vi har nok data via billeder og mål, kan vi normalt give en tydelig prisramme eller fast pris."
  },
  {
    question: "Er finish med i prisen?",
    answer:
      "Ja, standard finish er med. Særlige ønsker eller ekstra lag vurderes separat."
  },
  {
    question: "Kan jeg booke før endelig pris?",
    answer:
      "Ja, du kan booke tid og få endelig afklaring efter hurtig billedvurdering."
  },
  {
    question: "Hvad hvis bordpladen ikke er massiv træ?",
    answer:
      "Så anbefaler vi en alternativ vej via tilbudstid eller kontakt, så du ikke bruger unødigt budget."
  },
  {
    question: "Hvordan får jeg hurtigste pris?",
    answer:
      "Upload 3–6 billeder inklusiv kantfoto i prisberegneren. Det giver hurtig og præcis vurdering."
  },
  {
    question: "Har I akutte tider?",
    answer:
      "Ja, vi tilbyder akutte tider med fast pris inden for 14 dage, når kalenderen tillader det."
  }
];

const priceFaqAppendItems = [
  {
    question: "Hvorfor kan to ens køkkener koste forskelligt?",
    answer:
      "Fordi tilstand og detaljer betyder meget: dybe skjolder, varmepletter, mange udskæringer og tidligere behandling kan øge forarbejdet."
  },
  {
    question: "Kan I give en pris uden billeder?",
    answer:
      "Vi kan give et vejledende pejlemærke, men billeder gør vurderingen langt mere præcis og minimerer overraskelser."
  },
  {
    question: "Hvad gør en opgave dyrere end priseksemplerne?",
    answer:
      "Typisk ekstra elementer (spisebord/bryggers/vandfald), flere udskæringer, eller skader der kræver ekstra opbygning og finisharbejde."
  },
  {
    question: "Skal bordpladen altid afmonteres?",
    answer:
      "Ikke nødvendigvis. Det afhænger af opgaven og de praktiske forhold. Vi afklarer det, når vi har set billeder og mål."
  },
  {
    question: "Hvad hvis jeg er i tvivl om olie eller lak?",
    answer:
      "Det er helt normalt. Vi hjælper dig med at vælge ud fra brug og ønsket vedligehold, så du får en løsning der passer til din hverdag."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Pris på bordpladeslibning",
  description:
    "Prisvurdering og prisguide for bordpladeslibning i massiv træ med klare eksempler, slots og finishvalg.",
  url: "https://bpslib.dk/bordpladeslibning/pris"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning på Sjælland",
    item: "https://bpslib.dk/bordpladeslibning-sjaelland"
  },
  { name: "Pris", item: "https://bpslib.dk/bordpladeslibning/pris" }
]);

export const metadata = buildMetadata({
  title: "Pris på bordpladeslibning i massiv træ",
  description:
    "Se prisfaktorer, eksempler og slots for bordpladeslibning i massiv træ. Få præcis pris via billeder eller book tid direkte.",
  path: "/bordpladeslibning/pris"
});

export default function BordpladePrisPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <PageHero
        eyebrow="Pris-hub"
        title="Pris på bordpladeslibning i massiv træ"
        intro="Denne side samler alt om pris: hvad der påvirker beløbet, hvad der er inkluderet, hvordan slots planlægges, og hvordan du får et realistisk estimat hurtigt."
        showAkutteTider
      />

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvad påvirker prisen?</h2>
        <div className="mt-4 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
          <p>
            <span className="font-semibold text-foreground">Mål:</span> længde, dybde, tykkelse og
            geometri påvirker tidsforbrug og materialeforbrug.
          </p>
          <p>
            <span className="font-semibold text-foreground">Tilstand:</span> skjolder, ridser og
            gamle behandlinger kan kræve ekstra klargøring.
          </p>
          <p>
            <span className="font-semibold text-foreground">Finish:</span> valg mellem olie og lak
            påvirker opbygning, tørretid og vedligehold. Sæbebehandling kan udføres, men anbefales
            sjældent til bordplader.
          </p>
          <p>
            <span className="font-semibold text-foreground">Ekstra arbejde:</span> komplicerede
            kanter, udskæringer og lokale skader kan udvide omfanget.
          </p>
        </div>
        <div className="mt-6">
          <CtaRow showAkutteTider primaryLabel="Få præcis pris via billeder" />
        </div>
      </section>

      <section className="py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-foreground">Priseksempler (vejledende intervaller)</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Intervallerne er vejledende. Endelig pris kræver billedvurdering af din konkrete bordplade.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Køkkener ligger normalt mellem 3.500 og 5.000 kr. Små køkkener kan i enkelte tilfælde lande
          på 3.000 kr. Priser over 5.000 kr. skyldes typisk tilvalg som spisebord, vandfald eller
          bryggers.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {priceExamples.map((example) => (
            <article key={example.title} className="rounded-2xl border border-border/70 bg-white/70 p-5">
              <h3 className="text-base font-semibold text-foreground">{example.title}</h3>
              <p className="mt-2 text-sm font-semibold text-primary">{example.range}</p>
              <p className="mt-2 text-sm text-muted-foreground">{example.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 py-4 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-xl font-semibold text-foreground">Slots: 1, 2 eller 3 forløb</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">1 slot (08:00):</span> mindre opgaver
              med begrænset slitage.
            </p>
            <p>
              <span className="font-semibold text-foreground">2 slots (08:00 + 11:00):</span>
              mellemstore opgaver med synlige skader og ekstra finisharbejde.
            </p>
            <p>
              <span className="font-semibold text-foreground">3 slots (08:00 + 11:00 + 13:30):</span>
              større eller mere komplekse opgaver med høj detaljegrad.
            </p>
          </div>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/bordpladeslibning/book">Book tid</Link>
            </Button>
          </div>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-xl font-semibold text-foreground">Inkluderet vs. ikke inkluderet</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Inkluderet:</span> standard afdækning,
              slibning, aftalt finish og afsluttende gennemgang.
            </p>
            <p>
              <span className="font-semibold text-foreground">Ikke inkluderet:</span> større
              reparation af underkonstruktion, uforudsete materialeskader eller opgaver udenfor aftalt
              omfang.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <Link href="/bordpladeslibning/kan-det-slibes" className="hover:text-foreground">
              Afklar materiale før opstart
            </Link>
            <Link href="/akutte-tider" className="hover:text-foreground">
              Se akutte tider
            </Link>
          </div>
        </article>
      </section>

      <MiniCase
        caseSlug="pris-hub"
        title="Prisforløb med skjolder og ridser"
        problem="Kunden havde både varme-skjolder og dybe ridser med ujævn gammel behandling."
        solution="Foto-vurdering, 2-slot plan og finishvalg efter brugsmønster."
        outcome="Klar prisramme, effektiv udførelse og markant bedre overflade uden overraskelser."
      />

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Midtvejs: få din konkrete pris</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Brug AI-prisberegneren med billeder og mål. Jo bedre input, jo mere præcis pris og slot-plan.
        </p>
        <div className="mt-4">
          <CtaRow showAkutteTider primaryLabel="Få konkret pris nu" />
        </div>
      </section>

      <InternalLinkGrid
        title="Interne links til prisuniverset"
        intro="Herfra kan du gå direkte til de mest relevante sider for valg, afklaring og booking."
        links={[
          { href: "/bordpladeslibning-sjaelland", label: "Pillar: bordpladeslibning på Sjælland" },
          { href: "/bordpladeslibning/kan-det-slibes", label: "Kan det slibes?" },
          { href: "/bordpladeslibning/olie-eller-lak", label: "Olie eller lak" },
          { href: "/bordpladeslibning/skjolder", label: "Skjolder" },
          { href: "/bordpladeslibning/ridser", label: "Ridser" },
          { href: "/bordpladeslibning/prisberegner", label: "AI-prisberegner" },
          { href: "/bordpladeslibning/book", label: "Book tid" },
          { href: "/akutte-tider", label: "Akutte tider" }
        ]}
      />

      <FaqSection
        items={faqItems}
        intro="Prisspørgsmålene her hjælper dig med at forstå hvad der driver prisen og hvordan du får et sikkert estimat."
      />

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvad bestemmer den endelige pris?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Priseksemplerne ovenfor er et godt pejlemærke, men den endelige pris afhænger af bordpladens opbygning, tilstand og den finish du ønsker. To bordplader med samme størrelse kan kræve forskelligt arbejde, hvis der fx er dybe skjolder, varmepletter, mange udskæringer eller en kantprofil der skal respekteres.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Målet er altid det samme: en overflade der føles ens, ser ens ud i lys – og som holder til normal brug.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Dybden af skader (ridser, pletter, varme/brændemærker)</li>
          <li>Antal udskæringer (vask, kogeplade) og kanter/hjørner</li>
          <li>Bordpladens opbygning (massiv træ vs. finér/laminat)</li>
          <li>Valg af finish (udtryk + vedligehold)</li>
          <li>Praktisk adgang og om bordpladen skal af-/påmonteres</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Massiv træ eller finér — derfor spørger vi altid ind</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Vi arbejder kun med massiv træ, fordi det giver mulighed for at slibe og genopbygge overfladen korrekt. Ved finér kan der være et meget tyndt toplag, som gør det risikabelt at slibe, hvis skaderne sidder dybt.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Hvis du er i tvivl om materialet, kan et billede af kanten (eller endetræ) ofte afklare det hurtigt.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Se guide: <Link href="/bordpladeslibning/kan-det-slibes" className="font-medium text-foreground hover:text-primary">Kan din bordplade slibes? → /bordpladeslibning/kan-det-slibes</Link>
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Olie eller lak — hvad betyder det i praksis?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Finishvalget handler både om udtryk og drift. Nogle vil have et mere “naturligt” look, andre prioriterer en overflade der er nem at holde pæn i et travlt køkken.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Vi rådgiver ud fra hvordan bordpladen bruges (madlavning, børn, meget vand, osv.), så du får en løsning der giver mening i hverdagen — ikke bare på dag 1.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Olie kan give et varmt udtryk og kan ofte vedligeholdes løbende</li>
          <li>Lak kan være mere lukket/robust i daglig drift og kræver typisk mindre løbende pleje</li>
          <li>Det rigtige valg afhænger af brug, forventninger og hvor “perfekt” du vil holde overfladen</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sådan får du en præcis vurdering via billeder</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Den hurtigste vej til en præcis vurdering er billeder. Når vi kan se både helheden og problemområderne, kan vi typisk vurdere tilstand, arbejdsomfang og hvilket finishvalg der passer bedst — før du binder dig.
        </p>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Send gerne disse 4 ting</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>1 billede af hele bordpladen/køkkenet</li>
          <li>2 nærbilleder af overfladen i godt lys</li>
          <li>1 billede af de værste områder (skjolder/ridser/varmepletter)</li>
          <li>1 billede af kanten/enden (for at afklare massiv træ)</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/bordpladeslibning/book">Book tid</Link>
          </Button>
        </div>
      </section>

      <FaqSection
        title="Ofte stillede spørgsmål om pris"
        items={priceFaqAppendItems}
      />

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Se også</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <Link href="/bordpladeslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
              Bordpladeslibning på Sjælland
            </Link>
          </li>
          <li>
            <Link href="/bordpladeslibning/kan-det-slibes" className="font-medium text-foreground hover:text-primary">
              Kan den slibes?
            </Link>
          </li>
          <li>
            <Link href="/bordpladeslibning/prisberegner" className="font-medium text-foreground hover:text-primary">
              Prisberegner via billeder
            </Link>
          </li>
          <li>
            <Link href="/bordpladeslibning/book" className="font-medium text-foreground hover:text-primary">
              Book tid
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Klar til næste skridt?</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Send billeder for en præcis vurdering, eller book en tid hvis du er klar til udførelse.
        </p>
        <div className="mt-4">
          <CtaRow showAkutteTider primaryLabel="Få AI-prisestimat" />
        </div>
      </section>

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </main>
  );
}
