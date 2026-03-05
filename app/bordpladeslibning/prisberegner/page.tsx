import Link from "next/link";

import { EstimatorForm } from "@/components/estimator/EstimatorForm";
import { CtaRow } from "@/components/bordplade/CtaRow";
import { CONTACT_PHONE_DISPLAY, CONTACT_TEL_HREF } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Bordpladeslibning | Beregn pris via billeder | AI vurdering",
  description:
    "Upload 3-6 billeder og få et AI-prisestimat på bordpladeslibning på ca. 2 minutter. Kun massiv træ. Gratis og uforpligtende.",
  path: "/bordpladeslibning/prisberegner"
});

export default function PrisberegnerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <section className="py-10 md:py-14">
        <div className="space-y-5 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            AI-prisberegner
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Få et AI-prisestimat via billeder (kun massiv træ)
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
            Upload 3-6 billeder (hel bordplade/køkken, tæt på overfladen og problemområder), skriv dit navn og
            telefonnummer, og få et AI-prisestimat på ca. 2 minutter. Den endelige pris gælder først
            efter bookingbekræftelse.
          </p>
          <CtaRow showAkutteTider primaryLabel="Få AI-prisestimat" />
          <div className="rounded-2xl border border-border/80 bg-white/80 p-4 text-sm">
            <p className="font-semibold text-foreground">
              Denne AI-prisberegner gælder kun bordplader i massiv træ.
            </p>
            <p className="mt-1 text-muted-foreground">
              Gulvafslibning med AI kommer snart. Indtil da giver vi manuel prisvurdering.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link href="/gulvafslibning/pris" className="font-semibold text-primary">
                Se pris på gulvafslibning
              </Link>
              <a href={CONTACT_TEL_HREF} className="font-semibold text-primary">
                Ring for pris: {CONTACT_PHONE_DISPLAY}
              </a>
            </div>
          </div>
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
