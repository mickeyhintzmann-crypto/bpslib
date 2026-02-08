import Link from "next/link";

import { EstimatorForm } from "@/components/estimator/EstimatorForm";
import { CtaRow } from "@/components/bordplade/CtaRow";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Prisberegner",
  description:
    "Upload 3-6 billeder af bordpladen og få hurtig vurdering. Kun massiv træ, tydelig databehandling og svar hurtigt.",
  path: "/bordpladeslibning/prisberegner"
});

export default function PrisberegnerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <section className="py-10 md:py-14">
        <div className="space-y-5 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Prisberegner
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Få pris via billeder (kun massiv træ)
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
            Upload 3-6 billeder, inklusive kant/ende ved behov. Vi vender hurtigt tilbage med
            vurdering af opgaven, næste skridt og realistisk prisniveau.
          </p>
          <CtaRow showAkutteTider />
        </div>
      </section>

      <EstimatorForm />

      <section className="mt-6 rounded-2xl border border-border/70 bg-white/70 p-5 text-sm text-muted-foreground">
        <p>
          Har du allerede en klar plan? Gå direkte til
          <Link href="/bordpladeslibning/book" className="ml-1 font-semibold text-primary">
            booking
          </Link>
          eller læs
          <Link href="/bordpladeslibning/pris" className="ml-1 font-semibold text-primary">
            prisguiden
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
