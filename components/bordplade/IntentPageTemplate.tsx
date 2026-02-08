import { FaqSection } from "@/components/bordplade/FaqSection";
import { InternalLinkGrid } from "@/components/bordplade/InternalLinkGrid";
import { MiniCase } from "@/components/bordplade/MiniCase";
import { PageHero } from "@/components/bordplade/PageHero";
import {
  StructuredData,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema
} from "@/components/seo/StructuredData";
import type { IntentPageData } from "@/lib/bordplade/intent-data";

const BASE_URL = "https://bpslib.dk";

const baseLinks = [
  { href: "/bordpladeslibning-sjaelland", label: "Til bordpladeslibning på Sjælland" },
  { href: "/bordpladeslibning/pris", label: "Se prisguiden" },
  { href: "/bordpladeslibning/kan-det-slibes", label: "Afklar om bordpladen kan slibes" },
  { href: "/bordpladeslibning/prisberegner", label: "Få pris via billeder" },
  { href: "/bordpladeslibning/book", label: "Book tid" },
  { href: "/akutte-tider", label: "Se akutte tider" }
];

export const IntentPageTemplate = ({ data }: { data: IntentPageData }) => {
  const linkMap = new Map<string, { href: string; label: string }>();
  [...baseLinks, ...data.relatedLinks].forEach((link) => {
    if (!linkMap.has(link.href)) {
      linkMap.set(link.href, link);
    }
  });

  const links = Array.from(linkMap.values());

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Forside", item: `${BASE_URL}` },
    { name: "Bordpladeslibning på Sjælland", item: `${BASE_URL}/bordpladeslibning-sjaelland` },
    { name: data.title, item: `${BASE_URL}${data.path}` }
  ]);

  const serviceSchema = buildServiceSchema({
    name: data.serviceName,
    description: data.serviceDescription,
    url: `${BASE_URL}${data.path}`
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <PageHero eyebrow={data.eyebrow} title={data.title} intro={data.heroIntro} />

      <section className="space-y-8 py-4">
        {data.sections.map((section) => (
          <article key={section.heading} className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-foreground">{section.heading}</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={`${section.heading}-${paragraphIndex}`}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <MiniCase {...data.miniCase} />

      <InternalLinkGrid
        title="Næste relevante skridt"
        intro="Brug linkene til pris, materialeafklaring og relaterede problem-sider."
        links={links}
      />

      <FaqSection
        items={data.faq}
        intro="Svarene her er skrevet ud fra typiske spørgsmål fra kunder med massiv træbordplade."
      />

      <StructuredData data={serviceSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={buildFaqSchema(data.faq)} />
    </main>
  );
};
