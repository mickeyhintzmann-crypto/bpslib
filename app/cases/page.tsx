import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cases",
  description: "Se eksempler på bordpladeslibning i massiv træ. Vi viser før/efter og beskriver processen.",
  path: "/cases"
});

export default function CasesPage() {
  return (
    <PageShell title="Cases og resultater">
      <p>
        Her samler vi eksempler på bordplader i massiv træ, der har fået nyt liv med slibning og
        behandling.
      </p>
      <p>
        Vi opdaterer løbende med flere cases og billeder, så du kan se niveauet og finishen.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/bordpladeslibning/prisberegner">Få pris på din bordplade</Link>
        </Button>
      </div>
    </PageShell>
  );
}
