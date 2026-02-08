import Link from "next/link";

import { Button } from "@/components/ui/button";

export const MassivTraeCallout = () => {
  return (
    <section className="rounded-3xl border border-border/70 bg-white/70 px-6 py-8 md:px-10">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Vi sliber kun massiv træ</h2>
          <p className="text-sm text-muted-foreground">
            Vi arbejder ikke med laminat eller finer. Upload billeder, så vurderer vi hurtigt om
            din bordplade kan slibes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/bordpladeslibning/prisberegner">Upload og få vurdering</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
