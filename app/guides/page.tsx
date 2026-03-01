import Link from "next/link";

import { GuidesGallery } from "@/components/guides/GuidesGallery";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Guides & Råd | Bordpladeslibning og vedligehold | BPSLIB",
  description:
    "Guides og råd om bordpladeslibning, gulvafslibning og vedligehold. Find den rigtige løsning og få et overblik.",
  path: "/guides"
});

export default function GuidesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Guides &amp; Råd
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Her finder du vores korte guides til pris, finish og typiske problemer — skrevet, så du
          hurtigt kan tage en beslutning.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Start med den guide der matcher din situation, og hop videre til vurdering eller booking
          når du er klar.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Bordplade: pris, finish og problemer</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          En bordplade kan ofte reddes med slibning og den rigtige finish — men det afhænger af
          trætype, skader og forventet brug. Brug guiderne her til at afklare prisniveau, valg af
          olie vs. lak og hvordan du håndterer typiske problemer som skjolder og ridser.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>
            <Link href="/bordpladeslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
              Bordpladeslibning på Sjælland
            </Link>
          </li>
          <li>
            <Link href="/bordpladeslibning/prisberegner" className="font-medium text-foreground hover:text-primary">
              Prisberegner
            </Link>
          </li>
          <li>
            <Link href="/bordpladeslibning/kan-det-slibes" className="font-medium text-foreground hover:text-primary">
              Kan det slibes?
            </Link>
          </li>
          <li>
            <Link href="/bordpladeslibning/olie-eller-lak" className="font-medium text-foreground hover:text-primary">
              Olie eller lak
            </Link>
          </li>
          <li>
            <Link href="/bordpladeslibning/skjolder" className="font-medium text-foreground hover:text-primary">
              Skjolder
            </Link>
          </li>
          <li>
            <Link href="/bordpladeslibning/ridser" className="font-medium text-foreground hover:text-primary">
              Ridser
            </Link>
          </li>
          <li>
            <Link href="/bordpladeslibning/braendemaerker" className="font-medium text-foreground hover:text-primary">
              Brændemærker
            </Link>
          </li>
          <li>
            <Link href="/bordpladeslibning/slidt-mat-overflade" className="font-medium text-foreground hover:text-primary">
              Slidt og mat overflade
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Gulvafslibning: pris, finish og vedligehold</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Gulve slides forskelligt alt efter træsort, trafik og tidligere behandling. Her samler vi
          guider, der hjælper dig med at forstå prisfaktorer, vælge en finish der passer til
          hverdagen, og få realistiske forventninger til forløb og vedligehold.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>
            <Link href="/gulvafslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
              Gulvafslibning på Sjælland
            </Link>
          </li>
          <li>
            <Link href="/gulvafslibning-koebenhavn" className="font-medium text-foreground hover:text-primary">
              Gulvafslibning i København
            </Link>
          </li>
          <li>
            <Link href="/gulvafslibning-koebenhavn-omegn" className="font-medium text-foreground hover:text-primary">
              Gulvafslibning i København og omegn
            </Link>
          </li>
          <li>
            <Link href="/gulvafslibning/olie" className="font-medium text-foreground hover:text-primary">
              Olie
            </Link>
          </li>
          <li>
            <Link href="/gulvafslibning/lak" className="font-medium text-foreground hover:text-primary">
              Lak
            </Link>
          </li>
          <li>
            <Link href="/gulvafslibning/saebe" className="font-medium text-foreground hover:text-primary">
              Sæbe
            </Link>
          </li>
          <li>
            <Link href="/gulvafslibning/pris" className="font-medium text-foreground hover:text-primary">
              Pris
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Gulvlægning: valg af gulv og praktiske forhold</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Hvis du overvejer nyt gulv, er det ofte underlaget og afslutningerne der afgør både pris
          og resultat. Her samler vi vores sider, så du hurtigt kan blive klog på valg af løsning og
          næste skridt.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>
            <Link href="/gulvlaegning-sjaelland" className="font-medium text-foreground hover:text-primary">
              Gulvlægning på Sjælland
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Microcement: når du vil have et sammenhængende udtryk</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Microcement er populært, fordi det giver et roligt, moderne udtryk — men kvaliteten
          afhænger især af opbygning og underlag. Her kan du starte og få overblik over mulighederne.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
          <li>
            <Link href="/microcement-sjaelland" className="font-medium text-foreground hover:text-primary">
              Microcement på Sjælland
            </Link>
          </li>
        </ul>
      </section>

      <GuidesGallery />

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Vil du have en vurdering på din opgave?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Send et par billeder og en kort beskrivelse, så vender vi tilbage med et konkret forslag
          til næste skridt.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tilbudstid">Book tilbudstid</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/cases">Se cases</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
