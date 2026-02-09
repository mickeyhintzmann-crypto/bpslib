import Link from "next/link";

import { Button } from "@/components/ui/button";

export const QuickActions = () => {
  return (
    <section className="rounded-3xl border border-border/70 bg-white/80 px-6 py-8 md:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Kom i gang</h2>
          <p className="text-sm text-muted-foreground">
            Få pris via billeder på få minutter, eller gå direkte til bordplade‑universet.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/70 px-3 py-1">Svar samme dag</span>
            <span className="rounded-full border border-border/70 px-3 py-1">Kun massiv træ</span>
            <span className="rounded-full border border-border/70 px-3 py-1">Sjælland</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning-sjaelland">Bordpladeslibning</Link>
          </Button>
          <Button asChild>
            <Link href="/bordpladeslibning/prisberegner">Beregn pris online</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
