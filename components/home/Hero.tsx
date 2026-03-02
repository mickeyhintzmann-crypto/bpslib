import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { HeroEstimatorCard } from "@/components/estimator/HeroEstimatorCard";
import { Button } from "@/components/ui/button";
import { CONTACT_TEL_HREF } from "@/lib/contact";
import { homeConfig } from "@/lib/site-config";

export const Hero = () => {
  const heroAlbumImage = "/media/featured:bordplade/20210320_105853.jpg";

  return (
    <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden">
      <BpsImage
        src={heroAlbumImage}
        alt="Bordplade i massiv træ før og efter behandling"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(94deg,hsl(220_32%_10%/0.88)_0%,hsl(220_30%_10%/0.76)_38%,hsl(220_24%_12%/0.48)_62%,hsl(220_24%_10%/0.26)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,hsl(var(--primary)/0.24),transparent_42%)]" />

      <div className="relative min-h-[640px] px-5 py-8 sm:px-7 md:min-h-[720px] md:px-9 md:py-12 lg:min-h-[760px]">
        <div className="mx-auto grid h-full w-full max-w-[1320px] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 xl:gap-16">
          <div className="space-y-6 text-white">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/85">
                Bordpladeslibning på Sjælland
              </p>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Bordpladeslibning på Sjælland – kun massiv træ
              </h1>
              <p className="max-w-xl text-base text-white/92 md:text-lg">
                Få et roligt overblik først. Upload 3–6 billeder og få et AI-prisestimat, eller book en
                tid når det passer dig. Akutte tider vises kun, når der er ledige slots.
              </p>
              <p className="max-w-xl text-sm text-white/82 md:text-base">
                Vi arbejder kun med massiv træbordplader og hjælper typisk med skjolder, ridser,
                brændemærker og slidte, matte overflader. Er du i tvivl om materialet, så send et
                billede af kanten eller enden.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-11 rounded-xl">
                <Link href="/bordpladeslibning/prisberegner">Få AI-prisestimat</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-11 rounded-xl border border-white/40 bg-white/16 text-white hover:bg-white/24"
              >
                <Link href="/bordpladeslibning/book">Book tid</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-11 rounded-xl border border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/akutte-tider">Se akutte tider</Link>
              </Button>
            </div>
            <a
              href={CONTACT_TEL_HREF}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/95 underline-offset-4 hover:text-white hover:underline"
            >
              Ring direkte: +45 2691 3737
            </a>
            <div className="flex flex-wrap gap-3 text-xs text-white/84">
              {homeConfig.trustBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/35 bg-white/12 px-3 py-1.5">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="flex w-full justify-start lg:justify-end">
            <HeroEstimatorCard />
          </div>
        </div>
      </div>
    </section>
  );
};
