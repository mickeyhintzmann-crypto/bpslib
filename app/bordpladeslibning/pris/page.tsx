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
    title: "Lille køkkenbord (let slitage)",
    range: "Fra ca. 2.900–4.200 kr.",
    note: "Typisk 1 slot ved begrænset klargøring."
  },
  {
    title: "Mellemstort bord (synlige mærker)",
    range: "Fra ca. 4.200–6.800 kr.",
    note: "Ofte 1–2 slots afhængigt af dybde i skader."
  },
  {
    title: "Stor bordplade med skjolder/ridser",
    range: "Fra ca. 6.500–10.500 kr.",
    note: "Typisk 2–3 slots inkl. ekstra klargøring."
  },
  {
    title: "Kompleks opgave med kanter og udskæringer",
    range: "Fra ca. 8.500–13.500 kr.",
    note: "Kræver ofte ekstra tid til geometri og finish-kontrol."
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
            påvirker opbygning, tørretid og vedligehold.
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
        title="Prisforløb med skjolder og ridser"
        problem="Kunden havde både varme-skjolder og dybe ridser med ujævn gammel behandling."
        solution="Foto-vurdering, 2-slot plan og finishvalg efter brugsmønster."
        outcome="Klar prisramme, effektiv udførelse og markant bedre overflade uden overraskelser."
      />

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Midtvejs: få din konkrete pris</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Brug prisberegneren med billeder og mål. Jo bedre input, jo mere præcis pris og slot-plan.
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
          { href: "/bordpladeslibning/prisberegner", label: "Prisberegner" },
          { href: "/bordpladeslibning/book", label: "Book tid" },
          { href: "/akutte-tider", label: "Akutte tider" }
        ]}
      />

      <FaqSection
        items={faqItems}
        intro="Prisspørgsmålene her hjælper dig med at forstå hvad der driver prisen og hvordan du får et sikkert estimat."
      />

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Klar til næste skridt?</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Send billeder for en præcis vurdering, eller book en tid hvis du er klar til udførelse.
        </p>
        <div className="mt-4">
          <CtaRow showAkutteTider primaryLabel="Få pris via billeder" />
        </div>
      </section>

      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
      <StructuredData data={breadcrumbSchema} />
    </main>
  );
}
