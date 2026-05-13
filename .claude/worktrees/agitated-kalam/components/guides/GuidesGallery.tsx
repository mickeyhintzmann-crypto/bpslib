"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";
import { guides, type GuideCategory, type GuideItem } from "@/lib/guides-data";

const categories: { value: GuideCategory; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "bordplader", label: "Bordplader" },
  { value: "gulve", label: "Gulve" },
  { value: "beslutningsguide", label: "Beslutningsguide" },
  { value: "generelt", label: "Generelt" }
];

const categoryLabel = (category: GuideItem["category"]) =>
  categories.find((item) => item.value === category)?.label || category;

const guideLinks: Record<string, string> = {
  "bordplade-pris": "/bordpladeslibning/pris",
  "bordplade-skjolder": "/bordpladeslibning/skjolder",
  "bordplade-ridser": "/bordpladeslibning/ridser",
  "bordplade-olie-eller-lak": "/bordpladeslibning/olie-eller-lak",
  "bordplade-braendemaerker": "/bordpladeslibning/braendemaerker",
  "bordplade-massiv-vs-finer": "/bordpladeslibning/kan-det-slibes",
  "gulvslibning-vs-afhoevling": "/gulvafslibning/gulvslibning",
  "gulv-lak-olie-saebe": "/gulvafslibning/lak",
  "gulv-ridser": "/gulvafslibning/ridser",
  "vaelg-finish-mat-vs-slidstaerk": "/bordpladeslibning/olie-eller-lak"
};

const getGuideLink = (slug: string) => guideLinks[slug] || "/kontakt";

export const GuidesGallery = () => {
  const [activeCategory, setActiveCategory] = useState<GuideCategory>("alle");

  const filteredGuides = useMemo(() => {
    if (activeCategory === "alle") {
      return guides;
    }
    return guides.filter((guide) => guide.category === activeCategory);
  }, [activeCategory]);

  return (
    <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filteredGuides.length} guides i denne kategori
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => setActiveCategory(category.value)}
            className={`rounded-full border px-4 py-1 text-sm ${
              activeCategory === category.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGuides.map((guide) => {
          const href = getGuideLink(guide.slug);
          const isComingSoon = href === "/kontakt";

          return (
            <article
              key={guide.slug}
              className="flex h-full flex-col rounded-2xl border border-border/70 bg-white shadow-sm"
            >
              {guide.image ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <BpsImage
                    src={guide.image}
                    alt={guide.imageAlt || guide.title}
                    width={640}
                    height={480}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                    {categoryLabel(guide.category)}
                  </span>
                  <span>{guide.readTimeMin} min læsetid</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">{guide.title}</h3>
                  <p className="text-sm text-muted-foreground">{guide.excerpt}</p>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  {isComingSoon ? (
                    <span className="text-xs font-semibold text-muted-foreground">Kommer snart</span>
                  ) : null}
                  <Button asChild variant="outline" size="sm">
                    <Link href={href}>{isComingSoon ? "Kontakt os" : "Læs fuld guide"}</Link>
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
