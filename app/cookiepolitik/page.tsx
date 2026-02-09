import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cookiepolitik",
  description:
    "Læs hvordan BP Slib bruger nødvendige cookies, og hvordan statistik først aktiveres efter samtykke.",
  path: "/cookiepolitik"
});

export default function CookiepolitikPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Cookiepolitik
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi forklarer her, hvilke cookies vi bruger, hvorfor vi bruger dem, og hvordan du styrer
          dit samtykke. Vi holder det enkelt og tydeligt.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/privatlivspolitik">Se privatlivspolitik</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/kontakt">Kontakt os</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6 py-10 text-sm leading-relaxed text-muted-foreground md:text-base">
        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Hvad er cookies?</h2>
          <p className="mt-3">
            Cookies er små tekstfiler, som gemmes i din browser for at få siden til at fungere
            stabilt og huske dine valg.
          </p>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Typer af cookies på siden</h2>
          <ul className="mt-3 space-y-2">
            <li>
              Nødvendige cookies: bruges til basale funktioner som sikkerhed, navigation og formularflow.
            </li>
            <li>
              Statistikcookies: kan aktiveres senere, men kun efter aktivt samtykke fra dig.
            </li>
          </ul>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Analytics og samtykke</h2>
          <p className="mt-3">
            Vi bruger Google Analytics til statistik, men kun hvis du accepterer cookies. Du kan
            altid afvise eller ændre dit valg ved at slette cookie “cookie_consent”, så banneret
            vises igen.
          </p>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Sådan ændrer du dit valg</h2>
          <p className="mt-3">
            Du kan til enhver tid ændre eller trække samtykke tilbage i cookie-indstillingerne,
            når cookie-løsningen er aktiv på siden.
          </p>
        </article>
      </section>
    </main>
  );
}
