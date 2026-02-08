import Link from "next/link";

import { AcuteBooking } from "@/components/booking/AcuteBooking";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Akutte tider til bordpladeslibning",
  description:
    "Ledige akutte tider de næste 14 dage til fast pris 3.000 kr. Book hurtigt og se opdaterede slots i listevisning.",
  path: "/akutte-tider"
});

export default function AkutteTiderPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <section className="py-10 md:py-14">
        <div className="space-y-5 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Akutte tider
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Akutte tider til bordpladeslibning (fast pris)
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
            Ledige tider de næste 14 dage. Fast pris 3.000 kr. Hurtig booking under 1 minut.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1">Kun massiv træ</span>
            <span className="rounded-full border border-border px-3 py-1">Fast pris 3.000 kr.</span>
            <span className="rounded-full border border-border px-3 py-1">Svar hurtigt</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/bordpladeslibning/book">Book almindelig tid</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
            </Button>
          </div>
        </div>
      </section>

      <AcuteBooking />
    </main>
  );
}
