import { CtaBand } from "@/components/marketing/cta-band";
import { ComplianceNote } from "@/components/marketing/compliance-note";
import { SectionHeading } from "@/components/marketing/section-heading";
import { TrustBlock } from "@/components/marketing/trust-block";
import { TransparencyBlock } from "@/components/marketing/transparency-block";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "How It Works",
  description:
    "See how we deliver a buyer-first shortlist in 24 hours and connect you with vetted local partners.",
  path: "/how-it-works"
});

const steps = [
  {
    title: "Step 1: Share your criteria",
    body: "Tell us the areas, budget, timeline, and must-haves. Our two-step form takes under 2 minutes."
  },
  {
    title: "Step 2: Receive your shortlist",
    body: "Within 24 hours, you’ll get 5–10 curated options with trade-offs clearly explained."
  },
  {
    title: "Step 3: Introductions + next steps",
    body: "We connect you with vetted agents, lawyers, and finance partners to move efficiently."
  }
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Process"
          title="Shortlist in 24 hours, without the noise"
          subtitle="Concierge support that respects your time and filters the market fast."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="font-display text-xl text-white">{step.title}</h3>
              <p className="mt-3 text-sm text-neutral-300">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Promise"
          title="What you receive"
          subtitle="A fast, clear way to make decisions across the right micro-zones."
        />
        <ul className="grid gap-3 md:grid-cols-2">
          {[
            "5–10 best-fit options with clear trade-offs.",
            "Guidance on micro-zones that match your lifestyle.",
            "A timeline and next-step plan for viewings and legal steps.",
            "Introductions to vetted partners who can execute quickly."
          ].map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <TransparencyBlock />

      <CtaBand
        title="Get your shortlist started"
        subtitle="Send your criteria and we’ll move fast."
      />

      <TrustBlock />
      <ComplianceNote />
    </div>
  );
}
