import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { CtaBand } from "@/components/marketing/cta-band";
import { TrustBlock } from "@/components/marketing/trust-block";
import { ComplianceNote } from "@/components/marketing/compliance-note";
import { SectionHeading } from "@/components/marketing/section-heading";
import { TransparencyBlock } from "@/components/marketing/transparency-block";
import { getAreas } from "@/lib/areas";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Buyer Concierge Costa del Sol",
  description:
    "Get a curated 5–10 property shortlist in 24 hours. Buyer-only concierge for Costa del Sol with clear trade-offs and fast response.",
  path: "/"
});

export default function HomePage() {
  const areas = getAreas();

  return (
    <div className="space-y-16">
      <Hero
        eyebrow="Buyer Concierge Costa del Sol"
        title="Get a curated property shortlist in 24 hours"
        subtitle="We cut through noise to deliver 5–10 best-fit options with clear trade-offs. WhatsApp-first, fast response, zero spam."
      />

      <section className="space-y-6">
        <SectionHeading
          eyebrow="How it works"
          title="A calm, buyer-first process"
          subtitle="We focus on speed, clarity, and the right introductions."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Send criteria",
              body: "Share areas, budget, timeline, and must-haves in two quick steps."
            },
            {
              title: "Shortlist in 24h",
              body: "Receive 5–10 best-fit options with trade-offs explained."
            },
            {
              title: "Partner introductions",
              body: "We connect you to vetted agents, lawyers, and finance partners."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="font-display text-xl text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-neutral-300">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <TransparencyBlock />

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Areas"
          title="Four priority markets, deeply mapped"
          subtitle="Each area gets its own micro-zones, trade-offs, and FAQs."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {areas.map((area) => (
            <Link
              key={area.slug}
              href={`/areas/${area.slug}`}
              className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 transition hover:border-white/40"
            >
              <h3 className="font-display text-2xl text-white">{area.name}</h3>
              <p className="mt-2 text-sm text-neutral-300">{area.summary}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-400">
                Explore {area.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <CtaBand
        title="Ready for your shortlist?"
        subtitle="Tell us your criteria and we’ll deliver a curated list within 24 hours."
      />

      <TrustBlock />
      <ComplianceNote />
    </div>
  );
}
