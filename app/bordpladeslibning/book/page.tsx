import Link from "next/link";

import { BookingWizard } from "@/components/booking/BookingWizard";
import { CtaRow } from "@/components/bordplade/CtaRow";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Book tid til bordpladeslibning",
  description:
    "Book tid til bordpladeslibning i massiv træ med roligt trin-for-trin flow, næste ledige tider og klar afbuds- og ombookingspolitik.",
  path: "/bordpladeslibning/book"
});

export default function BookingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <section className="py-10 md:py-14">
        <div className="space-y-5 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Booking
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Book tid til bordpladeslibning (kun massiv træ)
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
            Vælg opgavetype, adresse og en ledig tid i et roligt 5-trins flow. Hvis du er i tvivl om
            materialet eller opgavens størrelse, sender vi dig hurtigt videre til prisberegneren.
          </p>
          <CtaRow showAkutteTider />
        </div>
      </section>

      <BookingWizard />

      <section className="mt-6 rounded-2xl border border-border/70 bg-white/70 p-5 text-sm text-muted-foreground">
        <p>
          Se også
          <Link href="/akutte-tider" className="ml-1 font-semibold text-primary">
            akutte tider
          </Link>
          hvis du skal have en tid inden for 14 dage til fast pris.
        </p>
      </section>
    </main>
  );
}
