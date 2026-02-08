import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Handelsbetingelser",
  description:
    "Læs vilkår for booking, afbud, ombooking og akutte tider hos BPSLIB. Klar og venlig politik med 24-timersregel.",
  path: "/handelsbetingelser"
});

export default function HandelsbetingelserPage() {
  return (
    <PageShell title="Handelsbetingelser">
      <div className="rounded-2xl border border-border/70 bg-white/70 p-5">
        <h2 className="text-xl font-semibold text-foreground">Kort version</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Gratis afbud eller ombooking indtil 24 timer før aftalt tid.</li>
          <li>• Ved afbud senere end 24 timer kan et gebyr forekomme.</li>
          <li>• Akutte tider følger samme afbuds- og ombookingsregler.</li>
          <li>• Vi arbejder kun med bordplader i massiv træ.</li>
        </ul>
      </div>

      <h2 className="pt-4 text-xl font-semibold text-foreground">Afbud og ombooking</h2>
      <p>
        Vi ved, at planer kan ændre sig. Derfor kan du aflyse eller ombooke gratis indtil 24 timer
        før din aftalte tid. Ved senere afbud kan der opkræves gebyr, fordi tiden ofte ikke kan
        gives videre med kort varsel.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-foreground">Akutte tider</h2>
      <p>
        Akutte tider tilbydes til fast pris og med hurtig udførelse. Samme 24-timersregel gælder for
        afbud og ombooking. Hvis en akut tid bliver optaget under booking, tilbyder vi næste ledige
        mulighed.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-foreground">Booking og bekræftelse</h2>
      <p>
        Din booking er først endeligt bekræftet, når du modtager bekræftelse fra os. Vi forbeholder
        os ret til at kontakte dig for afklaring af opgaveomfang, materialetype og adgangsforhold.
      </p>

      <p>
        Har du spørgsmål, kan du altid bruge
        <Link href="/kontakt" className="ml-1 font-semibold text-primary">
          kontakt
        </Link>
        .
      </p>
    </PageShell>
  );
}
