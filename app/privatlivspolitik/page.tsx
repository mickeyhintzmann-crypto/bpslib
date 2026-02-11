import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = buildMetadata({
  title: "Privatlivspolitik",
  description:
    "Læs hvordan vi behandler kontaktdata, bookingdata og billeder til vurdering hos BP Slib (BPSLIB).",
  path: "/privatlivspolitik"
});

export default function PrivatlivspolitikPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Privatlivspolitik
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi behandler personoplysninger ansvarligt og kun til konkrete formål: vurdering af opgave,
          tilbud, booking og kundedialog. Har du spørgsmål, kan du altid kontakte os.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/kontakt">Kontakt os</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/cookiepolitik">Se cookiepolitik</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6 py-10 text-sm leading-relaxed text-muted-foreground md:text-base">
        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Hvilke data indsamler vi?</h2>
          <ul className="mt-3 space-y-2">
            <li>Kontaktoplysninger: navn, telefon og eventuelt email.</li>
            <li>Bookingoplysninger: adresse/postnr, ønsket tidspunkt og praktiske noter.</li>
            <li>Billeder til vurdering i prisberegneren.</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Formål med behandlingen</h2>
          <ul className="mt-3 space-y-2">
            <li>At vurdere om bordpladen er massiv træ og kan slibes.</li>
            <li>At sende tilbud eller prisvurdering på den konkrete opgave.</li>
            <li>At planlægge og gennemføre booking og kundeservice.</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Opbevaring og sletning</h2>
          <p className="mt-3">
            Billeder i prisberegneren bruges kun til vurdering af opgaven og slettes automatisk efter
            {" "}
            <span className="font-semibold text-foreground">{siteConfig.estimatorRetentionDays} dage</span>.
            Øvrige data opbevares kun så længe det er nødvendigt for dialog, opgaveforløb og lovpligtige krav.
          </p>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Databehandlere</h2>
          <p className="mt-3">
            Vi anvender Supabase til database og filopbevaring. Ved senere aktivering af email/SMS-
            tjenester eller analyseværktøjer opdaterer vi denne side med relevante databehandlere.
          </p>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Dine rettigheder</h2>
          <p className="mt-3">
            Du kan bede om indsigt, rettelse eller sletning af dine oplysninger. Skriv til os på
            {" "}
            <a href={`mailto:${siteConfig.email}`} className="font-medium text-foreground hover:text-primary">
              {siteConfig.email}
            </a>
            {" "}
            eller ring på
            {" "}
            <a href={`tel:${siteConfig.phone}`} className="font-medium text-foreground hover:text-primary">
              {siteConfig.phoneDisplay}
            </a>
            .
          </p>
        </article>
      </section>
    </main>
  );
}
