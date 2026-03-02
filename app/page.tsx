import Link from "next/link";

import { AcutePromo } from "@/components/home/AcutePromo";
import { BeforeAfterGallery } from "@/components/home/BeforeAfterGallery";
import { FeaturedReferences } from "@/components/home/FeaturedReferences";
import { FaqSchema, FaqSection } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { LinkRouter } from "@/components/home/LinkRouter";
import { MassivTraeCallout } from "@/components/home/MassivTraeCallout";
import { PriceEstimatorPromo } from "@/components/home/PriceEstimatorPromo";
import { PriceTeaser } from "@/components/home/PriceTeaser";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { ReferenceStrip } from "@/components/ReferenceStrip";
import { EnterpriseCaseShowcase } from "@/components/references/EnterpriseCaseShowcase";
import { ClientLogoWall } from "@/components/trust/ClientLogoWall";
import { Button } from "@/components/ui/button";
import { SecondaryServices } from "@/components/home/SecondaryServices";
import { ServiceArea } from "@/components/home/ServiceArea";
import { SpecialistSection } from "@/components/home/SpecialistSection";
import { SurfaceGuide } from "@/components/home/SurfaceGuide";
import { TrustHighlights } from "@/components/home/TrustHighlights";
import { TypicalResults } from "@/components/home/TypicalResults";
import { WhyChoose } from "@/components/home/WhyChoose";
import { WoodTypes } from "@/components/home/WoodTypes";
import {
  StructuredData,
  buildLocalBusinessSchema,
  buildServiceSchema,
  buildWebSiteSchema
} from "@/components/seo/StructuredData";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";

export const metadata = buildMetadata({
  title: "Bordpladeslibning på Sjælland (massiv træ)",
  description:
    "Få pris via billeder på massiv træbordplade, book tid eller se akutte tider. 15+ års erfaring på Sjælland.",
  path: "/",
  keywords: [
    "bordpladeslibning sjælland",
    "slibning af bordplade",
    "massiv træ bordplade",
    "oliebehandling bordplade",
    "pris på bordpladeslibning"
  ],
  ogImagePath: "/images/home/hero.jpg"
});

export default function HomePage() {
  const siteUrl = getSiteUrl();
  const localBusinessSchema = buildLocalBusinessSchema({
    name: siteConfig.companyName,
    description: "Bordpladeslibning på Sjælland – kun massiv træ.",
    url: siteUrl,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    areaServed: siteConfig.serviceArea,
    openingHours: [`Mo-Fr ${siteConfig.openingHours.weekdays}`]
  });
  const serviceSchema = buildServiceSchema({
    name: "Bordpladeslibning",
    description: "Bordpladeslibning i massiv træ på Sjælland.",
    url: `${siteUrl}/bordpladeslibning-sjaelland`
  });
  const webSiteSchema = buildWebSiteSchema({
    name: siteConfig.companyName,
    description: "Bordpladeslibning i massiv træ på Sjælland.",
    url: siteUrl
  });

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-20 md:px-6">
      <StructuredData data={localBusinessSchema} />
      <StructuredData data={serviceSchema} />
      <StructuredData data={webSiteSchema} />
      <Hero />
      <TrustHighlights />
      <ClientLogoWall />
      <EnterpriseCaseShowcase
        title="Udvalgte referencer"
        subtitle="Et udvalg af opgaver vi har udført – klik for at se billedserier."
        limit={6}
      />
      <section className="pb-6">
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/referencer">Se alle referencer</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/cases">Se cases</Link>
          </Button>
        </div>
      </section>
      <ReferenceStrip compact />
      <div className="section-divider my-4" />

      <SpecialistSection />
      <WhyChoose />
      <PriceEstimatorPromo />
      <AcutePromo />
      <FeaturedReferences />
      <TypicalResults />
      <ProcessSteps />
      <SurfaceGuide />
      <BeforeAfterGallery />
      <PriceTeaser />
      <MassivTraeCallout />
      <WoodTypes />
      <ServiceArea />
      <LinkRouter />
      <FaqSchema />
      <FaqSection />
      <SecondaryServices />
    </main>
  );
}
