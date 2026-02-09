import Link from "next/link";

import { Button } from "@/components/ui/button";

export const MassivTraeCallout = () => {
  return (
    <section className="rounded-3xl border border-border/70 bg-white/70 px-6 py-8 md:px-10">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Vi sliber kun massiv træ</h2>
          <p className="text-sm text-muted-foreground">
            Vi arbejder ikke med laminat eller finer. Er du i tvivl, så upload et billede af
            kanten/enden, så vurderer vi hurtigt om din bordplade kan slibes.
          </p>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Det kan vi typisk hjælpe med:</p>
            <ul className="grid gap-2">
              <li>• Skjolder efter vand, varme eller daglig brug</li>
              <li>• Ridser, små hak og ujævnheder i overfladen</li>
              <li>• Brændemærker og matte/slidte felter</li>
            </ul>
          </div>
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
