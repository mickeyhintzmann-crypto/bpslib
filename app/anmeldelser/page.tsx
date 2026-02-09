import Link from "next/link";

import { AnmeldHaandvaerkerEmbed } from "@/components/AnmeldHaandvaerkerEmbed";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Anmeldelser",
  description: "Anmeldelser og vurderinger af BPSLIB.",
  path: "/anmeldelser"
});

export default function AnmeldelserPage() {
  const anmeldelserEnabled = siteConfig.anmeldHaandvaerker.enabled;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Anmeldelser
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Her samler vi vores anmeldelser. Vi hjælper dig gerne videre med pris, booking eller
          spørgsmål.
        </p>
      </section>

      <div className="mt-6">
        <AnmeldHaandvaerkerEmbed />
        {!anmeldelserEnabled ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Anmeldelser integreres snart.
          </p>
        ) : null}
      </div>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Klar til næste skridt?</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Få en vurdering via billeder, book en tid eller kontakt os for afklaring.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/book">Book tid</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/kontakt">Kontakt</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
