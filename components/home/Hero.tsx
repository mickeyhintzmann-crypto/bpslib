import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";
import { homeAssets } from "@/lib/assets";
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
              <span key={badge} className="rounded-full border border-border/70 px-3 py-1">
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-white/70 shadow-sm">
          <BpsImage
            src={homeAssets.hero}
            alt="Bordplade i massiv træ før og efter behandling"
            width={1600}
            height={900}
            priority
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="h-full w-full object-cover"
          />
          <div className="space-y-2 border-t border-border/70 px-5 py-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Hurtig vurdering</p>
            <p>Upload billeder af overflade og kant, så vi kan vurdere massiv træ og næste skridt.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
