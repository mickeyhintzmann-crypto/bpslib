import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { PersonasBlock } from "@/components/marketing/personas-block";
import { MicroZonesBlock } from "@/components/marketing/microzones-block";
import { BudgetTradeoffsBlock } from "@/components/marketing/budget-tradeoffs-block";
import { MistakesBlock } from "@/components/marketing/mistakes-block";
import { InternalLinksBlock } from "@/components/marketing/internal-links-block";
import { FaqBlock } from "@/components/marketing/faq-block";
import { CtaBand } from "@/components/marketing/cta-band";
import { TrustBlock } from "@/components/marketing/trust-block";
import { ComplianceNote } from "@/components/marketing/compliance-note";
import { WhatYouReceive } from "@/components/marketing/what-you-receive";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumbs";
import { createMetadata } from "@/lib/seo/metadata";
import { getAreaBySlug, getIntentContent } from "@/lib/areas";

export function generateMetadata({
  params
}: {
  params: { area: string; intent: string };
}): Metadata {
  const area = getAreaBySlug(params.area);
  if (!area) {
    return createMetadata({
      title: "Area Intent Not Found",
      description: "The requested area intent page could not be found.",
      path: `/areas/${params.area}/${params.intent}`
    });
  }

  const intent = area.intents.includes(params.intent as never)
    ? getIntentContent(area, params.intent as never)
    : null;

  if (!intent) {
    return createMetadata({
      title: "Area Intent Not Found",
      description: "The requested area intent page could not be found.",
      path: `/areas/${params.area}/${params.intent}`
    });
  }

  return createMetadata({
    title: intent.seoTitle,
    description: intent.seoDescription,
    path: `/areas/${area.slug}/${intent.slug}`
  });
}

export default function AreaIntentPage({
  params
}: {
  params: { area: string; intent: string };
}) {
  const area = getAreaBySlug(params.area);
  if (!area) {
    notFound();
  }

  const intent = area.intents.includes(params.intent as never)
    ? getIntentContent(area, params.intent as never)
    : null;

  if (!intent) {
    notFound();
  }

  return (
    <div className="space-y-16">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Areas", path: "/areas" },
          { name: area.name, path: `/areas/${area.slug}` },
          { name: intent.name, path: `/areas/${area.slug}/${intent.slug}` }
        ]}
      />

      <Hero
        eyebrow={`${area.name} · ${intent.name}`}
        title={intent.keyword}
        subtitle="Free shortlist in 24 hours. Get 5–10 curated options with clear trade-offs."
      />

      <WhatYouReceive areaName={area.name} intentName={intent.name} />

      <PersonasBlock personas={intent.personas} />
      <MicroZonesBlock zones={area.microZones} />
      <BudgetTradeoffsBlock bands={intent.budgetBands} />
      <MistakesBlock items={intent.mistakes} />
      <InternalLinksBlock area={area} currentIntent={intent} />
      <FaqBlock faqs={intent.faqs} />

      <CtaBand
        title="Get your shortlist in 24 hours"
        subtitle="Share your criteria and we’ll send the best-fit options fast."
      />

      <TrustBlock />
      <ComplianceNote />
    </div>
  );
}
