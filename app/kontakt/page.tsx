import Link from "next/link";

import { ContactForm } from "@/components/contact/ContactForm";
import {
  StructuredData,
  buildFaqSchema,
  buildLocalBusinessSchema
} from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = buildMetadata({
  title: "Kontakt",
  description: "Kontakt BPSLIB for bordpladeslibning i massiv træ eller spørgsmål om priser og booking.",
  path: "/kontakt"
});

export default function KontaktPage() {
  const faqItems = [
    {
      question: "Hvordan får jeg hurtigst en pris?",
      answer:
        "Den hurtigste vej er prisberegneren, hvor du uploader billeder af bordpladen inklusiv kant/ende."
    },
    {
      question: "Kan jeg booke direkte?",
      answer:
        "Ja. Hvis opgaven er enkel, kan du booke direkte. Er du i tvivl om omfang, så start i prisberegneren."
    },
    {
      question: "Sliber I alle bordplader?",
      answer:
        "Vi sliber kun bordplader i massiv træ. Er du i tvivl om materiale, hjælper vi dig gerne med afklaring."
    },
    {
      question: "Har I akutte tider?",
      answer:
        "Ja, vi viser ledige akutte tider for de næste 14 dage med fast pris, når kapaciteten er til det."
    }
  ];

  const localBusinessSchema = buildLocalBusinessSchema({
    name: siteConfig.companyName,
    description:
      "Kontakt BP Slib for bordpladeslibning i massiv træ på Sjælland. Få pris, book tid eller se akutte tider.",
    url: "https://bpslib.dk/kontakt",
    telephone: siteConfig.phone,
    email: siteConfig.email,
    areaServed: siteConfig.serviceArea,
    openingHours: [`Mo-Fr ${siteConfig.openingHours.weekdays}`]
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Kontakt
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Ring eller skriv til os, hvis du vil have afklaring på pris, booking eller materiale.
          Vi arbejder med bordpladeslibning i massiv træ på hele {siteConfig.serviceArea}.
        </p>
        <div className="mt-6 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
          <p>
            Telefon:{" "}
            <a className="font-medium text-foreground hover:text-primary" href={`tel:${siteConfig.phone}`}>
              {siteConfig.phoneDisplay}
            </a>
          </p>
          <p>
            Email:{" "}
            <a className="font-medium text-foreground hover:text-primary" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
          </p>
          <p>Åbningstid (hverdage): {siteConfig.openingHours.weekdays}</p>
          <p>Serviceområde: {siteConfig.serviceArea}</p>
        </div>
        {siteConfig.showSvarSammeDag ? (
          <p className="mt-4 text-sm font-medium text-foreground">Svar typisk samme dag på hverdage.</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <a href={`tel:${siteConfig.phone}`}>Ring</a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/prisberegner">Få pris</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/book">Book tid</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/tilbudstid">Tilbudstid</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />

        <aside className="space-y-4 rounded-3xl border border-border/70 bg-white/75 p-5 md:p-6">
          <h2 className="text-xl font-semibold text-foreground">Ofte stillede spørgsmål</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.question} className="rounded-xl border border-border/70 bg-background/60 p-4">
                <summary className="cursor-pointer text-sm font-medium text-foreground">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
          <div className="rounded-xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            Har du en hasteopgave? Se{" "}
            <Link href="/akutte-tider" className="font-medium text-foreground hover:text-primary">
              akutte tider
            </Link>{" "}
            eller ring direkte.
          </div>
        </aside>
      </section>

      <StructuredData data={localBusinessSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
