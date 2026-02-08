import Link from "next/link";

import { Button } from "@/components/ui/button";
import { homeConfig } from "@/lib/site-config";

export const Hero = () => {
  return (
    <section className="py-12 md:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Bordpladeslibning på Sjælland
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Bordpladeslibning på Sjælland – kun massiv træ
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              Upload 3–6 billeder og få et prisestimat. Book en tid på under 1 minut. Akutte tider
              er live.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/bordpladeslibning/book">Book tid</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/akutte-tider">Akutte tider</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {homeConfig.trustBadges.map((badge) => (
              <span key={badge} className="rounded-full border border-border/70 px-3 py-1">
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border/70 bg-white/70 p-6 shadow-sm">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Hurtig vurdering</p>
            <p className="text-sm text-muted-foreground">
              Send billeder og mål, så får du en konkret vurdering og anbefaling af næste step.
            </p>
            <div className="rounded-2xl border border-dashed border-border/80 bg-white/80 px-4 py-6 text-center text-xs text-muted-foreground">
              Pladsholder til før/efter-billede
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
