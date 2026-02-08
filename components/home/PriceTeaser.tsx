import Link from "next/link";

import { Button } from "@/components/ui/button";

export const PriceTeaser = () => {
  return (
    <section className="grid gap-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-16">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Prisguide til bordplader</h2>
        <p className="text-sm text-muted-foreground">
          Vi giver altid en ærlig vurdering, før arbejdet starter. Prisen afhænger især af:
        </p>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>• Bordpladens mål og tykkelse</li>
          <li>• Tilstand, skjolder og ridser</li>
          <li>• Ønsket finish og behandling</li>
        </ul>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white/70 p-6">
        <p className="text-sm text-muted-foreground">
          Se prisguiden for overblik, eller upload billeder for en præcis vurdering.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/pris">Se prisguide</Link>
          </Button>
          <Button asChild>
            <Link href="/bordpladeslibning/prisberegner">Få præcis pris via billeder</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
