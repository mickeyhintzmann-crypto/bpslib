import { BeforeAfterGallery } from "@/components/home/BeforeAfterGallery";
import { FaqSchema, FaqSection } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { LinkRouter } from "@/components/home/LinkRouter";
import { MassivTraeCallout } from "@/components/home/MassivTraeCallout";
import { PriceTeaser } from "@/components/home/PriceTeaser";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { SecondaryServices } from "@/components/home/SecondaryServices";
import { ServiceArea } from "@/components/home/ServiceArea";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Bordpladeslibning på Sjælland (massiv træ)",
  description:
    "Få pris via billeder på massiv træbordplade, book tid eller se akutte tider. 15+ års erfaring på Sjælland.",
  path: "/"
});

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <Hero />
      <LinkRouter />
      <PriceTeaser />
      <BeforeAfterGallery />
      <MassivTraeCallout />
      <ProcessSteps />
      <ServiceArea />
      <FaqSchema />
      <FaqSection />
      <SecondaryServices />
    </main>
  );
}
