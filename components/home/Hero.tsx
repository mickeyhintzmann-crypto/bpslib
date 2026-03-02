import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";
import { homeAssets } from "@/lib/assets";
import { homeConfig } from "@/lib/site-config";

export const Hero = () => {
  return (
    <section className="relative py-12 md:py-20">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-8 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-secondary/80 blur-3xl"
      />
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="space-y-4 rounded-[28px] border border-border/70 bg-white/72 p-6 shadow-[0_16px_34px_hsl(20_30%_20%/0.08)] md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Bordpladeslibning på Sjælland
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Bordpladeslibning på Sjælland – kun massiv træ
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              Få et roligt overblik først. Upload 3–6 billeder og få et AI-prisestimat, eller book en
              tid når det passer dig. Akutte tider vises kun, når der er ledige slots.
            </p>
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">
              Vi arbejder kun med massiv træbordplader og hjælper typisk med skjolder, ridser,
              brændemærker og slidte, matte overflader. Er du i tvivl om materialet, så send et
              billede af kanten eller enden.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/bordpladeslibning/prisberegner">Få AI-prisestimat</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/bordpladeslibning/book">Book tid</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/akutte-tider">Se akutte tider</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {homeConfig.trustBadges.map((badge) => (
              <span key={badge} className="rounded-full border border-border/70 bg-white/70 px-3 py-1.5">
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="surface-panel overflow-hidden rounded-[30px]">
          <BpsImage
            src={homeAssets.hero}
            alt="Bordplade i massiv træ før og efter behandling"
            width={1600}
            height={900}
            priority
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="h-full w-full object-cover"
          />
          <div className="space-y-2 border-t border-border/70 bg-white/80 px-5 py-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Hurtig vurdering</p>
            <p>Upload billeder af overflade og kant, så vi kan vurdere massiv træ og næste skridt.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
