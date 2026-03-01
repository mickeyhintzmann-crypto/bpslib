import Link from "next/link";

import { ReferencesGrid } from "@/components/references/ReferencesGrid";
import { Button } from "@/components/ui/button";
import { referenceProjects } from "@/lib/references-data";

export const FeaturedReferences = () => {
  return (
    <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-white to-amber-50/40 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Tidligere projekter og referencer
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Her er et udvalg af opgaver vi har udført på massive træbordplader. Se finish, område og
            resultat, og gå videre til cases for flere før/efter-eksempler.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/cases">Se alle cases</Link>
          </Button>
          <Button asChild>
            <Link href="/referencer">Se alle referencer</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <ReferencesGrid projects={referenceProjects.slice(0, 3)} />
      </div>
    </section>
  );
};
