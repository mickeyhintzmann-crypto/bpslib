import Link from "next/link";
import { ComplianceNote } from "@/components/marketing/compliance-note";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ThankYouClient } from "@/components/lead/thank-you-client";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Thank You",
  description: "We received your criteria. Expect a shortlist within 24 hours.",
  path: "/thank-you",
  noIndex: true
});

export default function ThankYouPage() {
  return (
    <div className="space-y-12">
      <SectionHeading
        eyebrow="Thank you"
        title="We received your criteria"
        subtitle="Your shortlist will be delivered within 24 hours."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="font-display text-xl text-white">What happens next</h3>
          <ul className="mt-4 space-y-2 text-sm text-neutral-300">
            <li>We review your criteria and micro-zone fit.</li>
            <li>We curate 5–10 best-fit options with trade-offs.</li>
            <li>We follow up via WhatsApp or your preferred contact method.</li>
          </ul>
        </div>
        <ThankYouClient />
      </div>

      <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-neutral-400">
        <Link href="/areas" className="rounded-full border border-white/10 px-4 py-2 hover:text-white">
          Back to areas
        </Link>
        <Link href="/areas" className="rounded-full border border-white/10 px-4 py-2 hover:text-white">
          Compare areas
        </Link>
      </div>

      <ComplianceNote />
    </div>
  );
}
