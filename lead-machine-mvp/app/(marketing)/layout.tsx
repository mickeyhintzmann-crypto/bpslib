import type { ReactNode } from "react";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";
import { JsonLd } from "@/components/seo/json-ld";
import { LeadFormProvider } from "@/components/lead/lead-form-provider";
import { ConsentProvider } from "@/components/consent/consent-provider";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/schema";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema();

  return (
    <ConsentProvider>
      <LeadFormProvider>
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
          <JsonLd data={organizationSchema} />
          <JsonLd data={websiteSchema} />
          <MarketingNav />
          <main className="mx-auto w-full max-w-6xl px-6 py-14">
            {children}
          </main>
          <MarketingFooter />
        </div>
      </LeadFormProvider>
    </ConsentProvider>
  );
}
