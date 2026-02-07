import { SectionHeading } from "@/components/marketing/section-heading";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: "How we collect and use information for Buyer Concierge Costa del Sol.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Privacy"
        title="Privacy policy"
        subtitle="We only collect what we need to provide your shortlist and introductions."
      />

      <div className="space-y-6 text-sm text-neutral-300">
        <p>
          We collect contact details and search criteria you submit through our forms or WhatsApp.
          This information is used to deliver your shortlist and coordinate partner introductions.
        </p>
        <p>
          We do not sell your data. We only share your criteria with vetted partners required to
          deliver viewings, legal guidance, or financing support at your request.
        </p>
        <p>
          We store attribution data such as UTMs and click IDs (e.g., gclid, fbclid) to measure
          campaign performance. We also store your landing page and referrer to understand how you
          found us.
        </p>
        <p>
          Cookies are used for essential site operations and, only with your consent, analytics and
          marketing measurement. You can change preferences anytime via the cookie settings link in
          the footer.
        </p>
        <p>
          We retain lead data only as long as needed to provide your shortlist and introductions. You
          may request deletion at any time by emailing hello@buyerconciergecostadelsol.com.
        </p>
      </div>
    </div>
  );
}
