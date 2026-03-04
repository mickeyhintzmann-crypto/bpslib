import Link from "next/link";

import { CasesHubClient } from "@/components/cases/CasesHubClient";
import { Button } from "@/components/ui/button";
import { enterpriseCases } from "@/lib/enterpriseCases";
import { casesManifest } from "@/lib/mediaManifest";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cases | Bordplader, gulvafslibning og gulvbelægning",
  description:
    "Se før/efter-cases for bordplader, gulvafslibning og gulvbelægning. Åbn hvert fag og se flere cases.",
  path: "/cases",
  keywords: [
    "cases bordpladeslibning",
    "cases gulvafslibning",
    "cases gulvbelægning",
    "før efter bordplade",
    "træsort og olie farver",
    "massiv træbordplade"
  ],
  ogImagePath: "/images/cases/eg-hvid-after.jpg"
});

export default function CasesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Cases på tværs af fag
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Se før/efter-cases for bordplader, gulvafslibning og gulvbelægning. Vælg et fag og klik “Se flere”
          for at åbne den dedikerede caseside. Se også vores overblik over{" "}
          <Link href="/bordpladeslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            bordpladeslibning på Sjælland
          </Link>
          , prisguiden på{" "}
          <Link href="/bordpladeslibning/pris" className="font-medium text-foreground hover:text-primary">
            bordpladeslibning/pris
          </Link>
          , samt vores side med{" "}
          <Link href="/referencer" className="font-medium text-foreground hover:text-primary">
            referencer
          </Link>
          , samt guides til{" "}
          <Link href="/bordpladeslibning/skjolder" className="font-medium text-foreground hover:text-primary">
            skjolder
          </Link>
          ,{" "}
          <Link href="/bordpladeslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser
          </Link>
          , samt valg af{" "}
          <Link href="/bordpladeslibning/olie-eller-lak" className="font-medium text-foreground hover:text-primary">
            olie eller lak
          </Link>
          .
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi har også cases og billedserier inden for{" "}
          <Link href="/gulvafslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            gulvafslibning
          </Link>{" "}
          og{" "}
          <Link href="/gulvlaegning-sjaelland" className="font-medium text-foreground hover:text-primary">
            gulvbelægning
          </Link>
          .
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/book">Book tid</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/bordpladeslibning/pris">Se prisguide</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/referencer">Se referencer</Link>
          </Button>
        </div>
      </section>

      <CasesHubClient cases={casesManifest} enterpriseCases={enterpriseCases} />
    </main>
  );
}
