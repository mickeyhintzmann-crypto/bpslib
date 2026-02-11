import Link from "next/link";

import { CtaRow } from "@/components/bordplade/CtaRow";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { PageHero } from "@/components/bordplade/PageHero";
import {
  StructuredData,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Kan brændemærker altid fjernes?",
    answer:
      "Ikke altid helt, men i massiv træ kan de ofte reduceres markant eller fjernes, afhængigt af dybde og tidligere behandling."
  },
  {
    question: "Skader slibning bordpladen?",
    answer:
      "Nej, ikke når det udføres kontrolleret. Vi fjerner kun det nødvendige lag for at bevare styrke og geometri."
  },
  {
    question: "Olie eller lak efter reparation?",
    answer:
      "Det afhænger af brug og ønsket look. Vi rådgiver om den bedste løsning ud fra din hverdag og slidniveau."
  },
  {
    question: "Hvor lang tid tager det (1/2/3 slots)?",
    answer:
      "Mindre opgaver kan klares i 1 slot, mens dybere mærker eller større flader ofte kræver 2-3 sammenhængende slots."
  },
  {
    question: "Hvad koster det typisk?",
    answer:
      "Prisen afhænger af størrelse, tilstand og finish. Du får hurtigst en præcis vurdering ved at sende billeder og mål."
  },
  {
    question: "Kører I på hele Sjælland?",
    answer:
      "Ja, vi dækker hele Sjælland og planlægger tider ud fra opgavens omfang og geografi."
  }
];

const serviceSchema = buildServiceSchema({
  name: "Fjernelse af brændemærker i massiv træbordplade",
  description:
    "Vurdering, slibning og efterbehandling af brændemærker i massiv træbordplader på Sjælland.",
  url: "https://bpslib.dk/bordpladeslibning/braendemaerker"
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Forside", item: "https://bpslib.dk" },
  {
    name: "Bordpladeslibning på Sjælland",
    item: "https://bpslib.dk/bordpladeslibning-sjaelland"
  },
  {
    name: "Brændemærker i bordpladen",
    item: "https://bpslib.dk/bordpladeslibning/braendemaerker"
  }
]);

export const metadata = buildMetadata({
  title: "Brændemærker i bordplade | Kan det slibes væk? (massiv træ)",
  description:
    "Har du brændemærker eller varmepletter i en massiv træbordplade? Få pris via billeder, se akutte tider eller book tid til slibning på Sjælland med hurtig vurdering.",
  path: "/bordpladeslibning/braendemaerker"
});

export default function BraendemaerkerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <PageHero
        eyebrow="Problem: brændemærker"
        title="Brændemærker i bordpladen – kan det slibes væk?"
        intro="Brændemærker og varmepletter opstår typisk ved varmepåvirkning, udtørret finish eller tidligere forkert behandling. I mange tilfælde kan en massiv træbordplade reddes med korrekt slibning og ny overfladebehandling, så mærkerne bliver markant reduceret eller helt forsvinder. Vi vurderer altid skadens dybde, trætype og nuværende finish, før vi anbefaler løsning. Arbejder du i hele Sjælland, kan du få en hurtig afklaring ved at sende billeder, eller booke en tid direkte, hvis du allerede er klar."
        showAkutteTider
      />

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvad afgør om det kan reddes?</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <li>
            <span className="font-semibold text-foreground">Dybde:</span> jo dybere brændemærket er,
            desto mere kontrolleret slibning kræves.
          </li>
          <li>
            <span className="font-semibold text-foreground">Træsort:</span> hårde træsorter som eg
            reagerer anderledes end blødere sorter.
          </li>
          <li>
            <span className="font-semibold text-foreground">Finish:</span> eksisterende olie/lak
            påvirker både metode og slutresultat.
          </li>
          <li>
            <span className="font-semibold text-foreground">Tidligere behandling:</span> gamle lag,
            pletreparationer eller ujævn afslibning kan ændre processen.
          </li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Er du i tvivl om omfanget, kan du starte på{" "}
          <Link href="/bordpladeslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            bordpladeslibning på Sjælland
          </Link>{" "}
          og gå videre til den konkrete vurdering.
        </p>
      </section>

      <section className="py-8">
        <div className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Klar til hurtig vurdering?</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Send billeder nu og få en konkret anbefaling af pris, slot-behov og finish.
          </p>
          <div className="mt-4">
            <CtaRow showAkutteTider />
          </div>
        </div>
      </section>

      <section className="space-y-6 py-2">
        <h2 className="text-2xl font-semibold text-foreground">Sådan løser vi det</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-border/70 bg-white/70 p-5">
            <h3 className="text-base font-semibold text-foreground">1. Vurdering via billeder</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Du uploader billeder i{" "}
              <Link
                href="/bordpladeslibning/prisberegner"
                className="font-medium text-foreground hover:text-primary"
              >
                prisberegneren
              </Link>
              , så vi kan vurdere skadens niveau.
            </p>
          </article>
          <article className="rounded-2xl border border-border/70 bg-white/70 p-5">
            <h3 className="text-base font-semibold text-foreground">2. Kontrolleret slibning</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Vi sliber i trin for at reducere eller fjerne brændemærket uden unødigt tab af materiale.
              Ved kompleks skade anbefaler vi passende slot-længde.
            </p>
          </article>
          <article className="rounded-2xl border border-border/70 bg-white/70 p-5">
            <h3 className="text-base font-semibold text-foreground">3. Ny behandling (olie/lak)</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Efter slibning vælger vi behandling ud fra brugsmønster. Se vores guide til{" "}
              <Link
                href="/bordpladeslibning/olie-eller-lak"
                className="font-medium text-foreground hover:text-primary"
              >
                olie eller lak
              </Link>
              .
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Pris og tid</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Pris og tidsforbrug afhænger af bordpladens størrelse, mærkernes dybde og valg af finish.
          Start med at se{" "}
          <Link href="/bordpladeslibning/pris" className="font-medium text-foreground hover:text-primary">
            prisguiden
          </Link>{" "}
          for overblik, og brug derefter prisberegneren til præcis vurdering. Er du klar til udførelse,
          kan du{" "}
          <Link href="/bordpladeslibning/book" className="font-medium text-foreground hover:text-primary">
            booke tid
          </Link>{" "}
          direkte.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Ved lignende skader kan du også læse om{" "}
          <Link href="/bordpladeslibning/skjolder" className="font-medium text-foreground hover:text-primary">
            skjolder
          </Link>{" "}
          og{" "}
          <Link href="/bordpladeslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser
          </Link>
          .
        </p>
      </section>

      <section className="my-8 rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
        <h2 className="text-xl font-semibold text-foreground">Vi sliber kun massive træbordplader</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Er du i tvivl om materiale? Upload et tydeligt billede af bordpladen i{" "}
          <Link
            href="/bordpladeslibning/prisberegner"
            className="font-medium text-foreground hover:text-primary"
          >
            prisberegneren
          </Link>
          , så afklarer vi det hurtigt, før du bruger tid og budget på forkert løsning.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Næste skridt</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vælg om du vil have vurdering via billeder, booke en tid eller se akutte tider.
        </p>
        <div className="mt-4">
          <CtaRow showAkutteTider />
        </div>
      </section>

      <FaqSection
        items={faqItems}
        intro="Her er korte svar på de mest almindelige spørgsmål om brændemærker i massiv træbordplader."
      />

      <StructuredData data={serviceSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
