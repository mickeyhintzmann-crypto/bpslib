import { ComplianceNote } from "@/components/marketing/compliance-note";
import { SectionHeading } from "@/components/marketing/section-heading";
import { TransparencyBlock } from "@/components/marketing/transparency-block";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "About",
  description:
    "Buyer-only concierge built for clarity, speed, and local Costa del Sol expertise.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <div className="space-y-16">
      <SectionHeading
        eyebrow="About"
        title="Buyer-first, local, and transparent"
        subtitle="We focus on helping serious buyers move quickly with the right local partners."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Local expertise",
            body: "We map micro-zones across Costa del Sol and track demand signals continuously."
          },
          {
            title: "Curated network",
            body: "We introduce vetted agents, lawyers, and finance partners who specialize in buyers."
          },
          {
            title: "No listing noise",
            body: "We focus on clarity, not endless browsing. Shortlists are tailored and actionable."
          }
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-display text-xl text-white">{item.title}</h3>
            <p className="mt-3 text-sm text-neutral-300">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="E-E-A-T"
          title="How we build trust"
          subtitle="Experience, local partnerships, and transparent boundaries."
        />
        <ul className="grid gap-3 md:grid-cols-2">
          {[
            "Buyer-only focus with clear conflict boundaries.",
            "Local partner network across legal, finance, and agency roles.",
            "Transparent trade-off explanations in every shortlist.",
            "Fast response with WhatsApp-first coordination."
          ].map((item) => (
            <li key={item} className="rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Standards"
          title="Response time and partner quality"
          subtitle="We treat speed and accountability as non-negotiable."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "24-hour promise",
              body: "Shortlists are delivered within 24 hours once criteria are complete."
            },
            {
              title: "Partner SLA",
              body: "We prioritize partners who respond quickly and keep buyers informed."
            },
            {
              title: "Scoreboard mindset",
              body: "We track partner performance to keep quality and transparency high."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-display text-xl text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-neutral-300">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <TransparencyBlock />

      <ComplianceNote />
    </div>
  );
}
