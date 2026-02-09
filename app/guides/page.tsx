import Link from "next/link";

import { GuidesGallery } from "@/components/guides/GuidesGallery";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Guides & Råd | Bordpladeslibning og vedligehold | BPSLIB",
  description:
    "Guides og råd om bordpladeslibning, gulvafslibning og vedligehold. Find den rigtige løsning og få et overblik.",
  path: "/guides"
});

export default function GuidesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Guides &amp; Råd
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Praktiske guides om bordplader, gulve og vedligehold i hjemmet.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi samler vores bedste råd til bordpladeslibning på Sjælland, valg af olie eller lak og
          hvordan du vurderer skader som{" "}
          <Link href="/bordpladeslibning/skjolder" className="font-medium text-foreground hover:text-primary">
            skjolder
          </Link>{" "}
          og{" "}
          <Link href="/bordpladeslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser
          </Link>
          . Start med vores{" "}
          <Link href="/bordpladeslibning-sjaelland" className="font-medium text-foreground hover:text-primary">
            bordplade-hub
          </Link>{" "}
          eller sammenlign{" "}
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
            <Link href="/kontakt">Kontakt os</Link>
          </Button>
        </div>
      </section>

      <GuidesGallery />
    </main>
  );
}
