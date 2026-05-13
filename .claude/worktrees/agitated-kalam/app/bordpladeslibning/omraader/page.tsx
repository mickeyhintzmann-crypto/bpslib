import Link from "next/link";

import { InternalLinkGrid } from "@/components/bordplade/InternalLinkGrid";
import { PageHero } from "@/components/bordplade/PageHero";
import { buildMetadata } from "@/lib/seo";
import { routes } from "@/lib/site-registry";

export const metadata = buildMetadata({
  title: "Bordpladeslibning – områder på Sjælland (massiv træ) | BPSLIB",
  description:
    "Se alle områder vi dækker med bordpladeslibning (kun massiv træ) på Sjælland. Få pris via billeder eller book tid.",
  path: "/bordpladeslibning/omraader"
});

const findRoute = (path: string) => routes.find((route) => route.path === path) ?? null;

const toLink = (path: string, fallbackLabel: string) => {
  const route = findRoute(path);
  return {
    href: route?.path ?? path,
    label: route?.title ?? fallbackLabel
  };
};

const regionPaths = [
  "/bordpladeslibning-koebenhavn-omegn",
  "/bordpladeslibning-amager",
  "/bordpladeslibning-nordsjaelland",
  "/bordpladeslibning-midtsjaelland",
  "/bordpladeslibning-vest-sydsjaelland"
];

const regionLinks = regionPaths.map((path) => toLink(path, path.replace("/", "")));
const regionSet = new Set(regionLinks.map((link) => link.href));

const cityLinksFromRegistry = routes
  .filter(
    (route) =>
      route.navGroup === "bordplade" &&
      route.path.startsWith("/bordpladeslibning-") &&
      route.path !== "/bordpladeslibning-sjaelland" &&
      !regionSet.has(route.path)
  )
  .map((route) => ({ href: route.path, label: route.title }));

const extraCityLinks = [
  { href: "/bordpladeslibning-slagelse", label: "Slagelse" }
].filter((link) => !cityLinksFromRegistry.find((item) => item.href === link.href));

const cityLinks = [...cityLinksFromRegistry, ...extraCityLinks].sort((a, b) =>
  a.label.localeCompare(b.label, "da")
);

export default function OmraaderPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <PageHero
        eyebrow="Områder"
        title="Områder vi dækker – bordpladeslibning (kun massiv træ)"
        intro="Vi kører på hele Sjælland med bordpladeslibning i massiv træ. Brug prisberegneren til en hurtig vurdering, eller book en tid direkte hvis du allerede er klar."
        showAkutteTider
      />

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          Vores fulde bordplade-univers finder du på{" "}
          <Link href="/bordpladeslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            bordpladeslibning på Sjælland
          </Link>
          . Se også{" "}
          <Link href="/bordpladeslibning/pris" className="font-medium text-foreground hover:text-primary">
            prisguiden
          </Link>
          , få en konkret vurdering i{" "}
          <Link href="/bordpladeslibning/prisberegner" className="font-medium text-foreground hover:text-primary">
            prisberegneren
          </Link>
          , eller{" "}
          <Link href="/bordpladeslibning/book" className="font-medium text-foreground hover:text-primary">
            book tid
          </Link>
          . Hvis du er i tvivl om finish, kan du læse om{" "}
          <Link href="/bordpladeslibning/olie-eller-lak" className="font-medium text-foreground hover:text-primary">
            olie eller lak
          </Link>
          . Ved almindelige problemer hjælper vi ofte med{" "}
          <Link href="/bordpladeslibning/skjolder" className="font-medium text-foreground hover:text-primary">
            skjolder
          </Link>
          .
        </p>
      </section>

      <InternalLinkGrid
        title="Regioner"
        intro="Vælg den region der passer til dit område på Sjælland."
        links={regionLinks}
      />

      <InternalLinkGrid
        title="Byer"
        intro="Se by-siderne for lokale detaljer og konkrete eksempler."
        links={cityLinks}
      />

      <section className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
        <h2 className="text-xl font-semibold text-foreground">Vi sliber kun massive træbordplader</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Er du i tvivl om materialet, så upload et kant- eller ende-billede i{" "}
          <Link href="/bordpladeslibning/prisberegner" className="font-medium text-foreground hover:text-primary">
            prisberegneren
          </Link>
          , så afklarer vi det hurtigt.
        </p>
      </section>
    </main>
  );
}
