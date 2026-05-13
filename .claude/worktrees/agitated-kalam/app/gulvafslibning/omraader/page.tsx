import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getRoutesByGroup } from "@/lib/site-registry";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Gulvafslibning – områder på Sjælland | BPSLIB",
  description:
    "Se områder vi dækker med gulvafslibning på Sjælland. Book uforpligtende tilbudstid eller kontakt os.",
  path: "/gulvafslibning/omraader"
});

const gulvRoutes = getRoutesByGroup("gulv");
const regionPaths = new Set([
  "/gulvafslibning-koebenhavn-omegn",
  "/gulvafslibning-amager",
  "/gulvafslibning-nordsjaelland",
  "/gulvafslibning-midtsjaelland",
  "/gulvafslibning-vest-sydsjaelland"
]);
const byPaths = new Set([
  "/gulvafslibning-koebenhavn",
  "/gulvafslibning-frederiksberg",
  "/gulvafslibning-gentofte",
  "/gulvafslibning-lyngby",
  "/gulvafslibning-gladsaxe",
  "/gulvafslibning-roedovre",
  "/gulvafslibning-hvidovre",
  "/gulvafslibning-ballerup",
  "/gulvafslibning-greve",
  "/gulvafslibning-ishoej",
  "/gulvafslibning-roskilde",
  "/gulvafslibning-koege",
  "/gulvafslibning-ringsted",
  "/gulvafslibning-holbaek",
  "/gulvafslibning-kalundborg",
  "/gulvafslibning-slagelse",
  "/gulvafslibning-naestved",
  "/gulvafslibning-hilleroed"
]);

const regionLinks = gulvRoutes.filter((route) => regionPaths.has(route.path));
const byLinks = gulvRoutes.filter((route) => byPaths.has(route.path));

export default function GulvOmraaderPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Områder vi dækker – gulvafslibning
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi udfører gulvafslibning på hele Sjælland og planlægger opgaver efter område og
          tilgængelighed. Du kan læse om{" "}
          <Link href="/gulvafslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            gulvafslibning på Sjælland
          </Link>
          , prisguiden på{" "}
          <Link href="/gulvafslibning/pris" className="font-medium text-foreground hover:text-primary">
            gulvafslibning/pris
          </Link>
          , eller muligheder som{" "}
          <Link href="/gulvafslibning/lak" className="font-medium text-foreground hover:text-primary">
            lak
          </Link>
          ,{" "}
          <Link href="/gulvafslibning/olie" className="font-medium text-foreground hover:text-primary">
            olie
          </Link>
          ,{" "}
          <Link href="/gulvafslibning/saebe" className="font-medium text-foreground hover:text-primary">
            sæbe
          </Link>
          , og håndtering af{" "}
          <Link href="/gulvafslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser
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

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Sådan planlægger vi opgaverne</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Vi samler opgaver geografisk, så du får en stabil tidsplan. Det giver kortere ventetid
            og en mere effektiv proces, uanset om du bor i en lejlighed, villa eller i sommerhus.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Har du brug for et hurtigt overblik, så book en tilbudstid eller kontakt os direkte.
          </p>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Typiske gulvtyper</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Plankegulve og brede brædder</li>
            <li>Parket og sildeben</li>
            <li>Ældre massive trægulve</li>
            <li>Gulve med tidligere lak eller olie</li>
          </ul>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Populære behandlinger</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi hjælper dig med at vælge den rigtige finish. Læs mere om{" "}
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
          . Har du skader, kan du også læse om{" "}
          <Link href="/gulvafslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser og pletter
          </Link>
          .
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Regioner</h2>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          {regionLinks.map((route) => (
            <Link key={route.path} href={route.path} className="hover:text-foreground">
              {route.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Byer</h2>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
          {byLinks.map((route) => (
            <Link key={route.path} href={route.path} className="hover:text-foreground">
              {route.title}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
