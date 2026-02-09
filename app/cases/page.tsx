import Link from "next/link";

import { FinishGallery } from "@/components/cases/FinishGallery";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cases | Træsort & olie-farver (massiv træ) | BPSLIB",
  description:
    "Se eksempler på træsorter og olie-farver på massive træbordplader. Få pris via billeder eller book tid.",
  path: "/cases"
});

export default function CasesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Cases (træsort & olie)
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Se eksempler på hvordan forskellige træsorter tager sig ud med olie-farver som Natur, Hvid,
          Sort og Dark Coco. Se også vores overblik over{" "}
          <Link href="/bordpladeslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            bordpladeslibning på Sjælland
          </Link>
          , prisguiden på{" "}
          <Link href="/bordpladeslibning/pris" className="font-medium text-foreground hover:text-primary">
            bordpladeslibning/pris
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
        </div>
      </section>

      <FinishGallery />
    </main>
  );
}
