import { ComplianceNote } from "@/components/marketing/compliance-note";
import { SectionHeading } from "@/components/marketing/section-heading";
import { TransparencyBlock } from "@/components/marketing/transparency-block";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Terms",
  description: "Terms and conditions for Buyer Concierge Costa del Sol.",
  path: "/terms"
});

export default function TermsPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Terms"
        title="Terms and conditions"
        subtitle="Concierge guidance with clear boundaries and responsibilities."
      />

      <div className="space-y-6 text-sm text-neutral-300">
        <p>
          Buyer Concierge Costa del Sol provides concierge guidance and introductions only. We are
          not a real estate agent, broker, law firm, or financial advisor.
        </p>
        <p>
          We do not negotiate price, handle deposits or client funds, or draft purchase contracts.
          Legal documentation, negotiations, and financial transactions are handled by your
          appointed agent and lawyer.
        </p>
        <p>
          We may receive referral fees from partners we introduce. Our priority is to protect the
          buyer experience with clear trade-offs and vetted introductions.
        </p>
        <p>
          Shortlist delivery time is a target, not a guarantee. We aim to deliver within 24 hours
          once complete criteria are received.
        </p>
        <p>
          By using this site, you agree to provide accurate information and understand that
          availability and pricing can change without notice.
        </p>
      </div>

      <TransparencyBlock />

      <ComplianceNote />
    </div>
  );
}
