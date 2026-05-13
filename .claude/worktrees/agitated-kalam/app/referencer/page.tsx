import Link from "next/link";

import {
  StructuredData,
  buildBreadcrumbSchema,
  buildItemListSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import { EnterpriseCaseShowcase } from "@/components/references/EnterpriseCaseShowcase";
import { ReferencesGrid } from "@/components/references/ReferencesGrid";
import { ClientLogoWall } from "@/components/trust/ClientLogoWall";
import { Button } from "@/components/ui/button";
import { referenceProjects } from "@/lib/references-data";
import { buildMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export const metadata = buildMetadata({
  title: "Referencer",
  description:
    "Se tidligere projekter og referencer på bordpladeslibning i massiv træ på Sjælland.",
  path: "/referencer",
  keywords: [
    "referencer bordpladeslibning",
    "tidligere projekter bordplade",
    "bordpladeslibning sjælland",
    "massiv træ bordplade"
  ],
  ogImagePath: "/images/cases/eg-natur-after.jpg"
});

export default function ReferencerPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Forside", item: siteUrl },
    { name: "Referencer", item: `${siteUrl}/referencer` }
  ]);
  const itemListSchema = buildItemListSchema(
    "Tidligere projekter og referencer",
    referenceProjects.map((project) => ({
      name: project.title,
      url: `${siteUrl}/referencer#${project.id}`,
      description: `${project.scope} Område: ${project.location}.`
    }))
  );
  const serviceSchema = buildServiceSchema({
    name: "Bordpladeslibning referencer",
    description: "Udvalgte referenceprojekter for bordpladeslibning i massiv træ på Sjælland.",
    url: `${siteUrl}/referencer`
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={itemListSchema} />
      <StructuredData data={serviceSchema} />

      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Referencer
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Her finder du et udvalg af tidligere projekter. Siden er lavet, så både brugere og
          søgemaskiner hurtigt kan se vores dokumenterede arbejde med massiv træbordplade.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Klik på en reference nedenfor for at åbne hele billedserien i lightbox.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/book">Book tid</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/cases">Se før/efter cases</Link>
          </Button>
        </div>
      </section>

      <ClientLogoWall />

      <EnterpriseCaseShowcase
        title="Udvalgte opgaver for store kunder"
        subtitle="Klik på en opgave for at se billedserien."
      />

      <section className="mt-8">
        <ReferencesGrid projects={referenceProjects} />
      </section>
    </main>
  );
}
