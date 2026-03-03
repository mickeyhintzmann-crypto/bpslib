"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EnterpriseCaseShowcase } from "@/components/references/EnterpriseCaseShowcase";
import type { EnterpriseCase } from "@/lib/enterpriseCases";
import type { CasesManifestCategory, CasesManifestItem } from "@/lib/mediaManifest";

type CasesHubClientProps = {
  cases: CasesManifestItem[];
  enterpriseCases: EnterpriseCase[];
};

const categories: { value: CasesManifestCategory; label: string; subtitle: string }[] = [
  { value: "bordplade", label: "Bordplader", subtitle: "Massiv træ – før/efter og afsluttet resultat" },
  { value: "gulvafslibning", label: "Gulvafslibning", subtitle: "Trægulve med synlig forskel før og efter" },
  { value: "gulvbelaegning", label: "Gulvbelægning", subtitle: "Sildeben, parket, vinyl og øvrige løsninger" }
];

const labelByCategory: Record<CasesManifestCategory, string> = {
  bordplade: "Bordplader",
  gulvafslibning: "Gulvafslibning",
  gulvbelaegning: "Gulvbelægning"
};

type ActiveFilter = "alle" | CasesManifestCategory;

const dedupe = (items: string[]) => [...new Set(items.filter(Boolean))];

export const CasesHubClient = ({ cases, enterpriseCases }: CasesHubClientProps) => {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("alle");
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const filteredCases = useMemo(() => {
    if (activeFilter === "alle") {
      return cases;
    }
    return cases.filter((item) => item.category === activeFilter);
  }, [activeFilter, cases]);

  const visibleCategories = useMemo(() => {
    if (activeFilter === "alle") {
      return categories;
    }
    return categories.filter((entry) => entry.value === activeFilter);
  }, [activeFilter]);

  const openCase = useMemo(
    () => filteredCases.find((item) => item.id === openCaseId) ?? null,
    [filteredCases, openCaseId]
  );

  const openCaseImages = useMemo(() => {
    if (!openCase) {
      return [];
    }
    return dedupe([...(openCase.gallery ?? []), openCase.afterSrc ?? "", openCase.beforeSrc ?? ""]);
  }, [openCase]);

  const activeImage = openCaseImages[activeImageIndex] ?? null;

  const openLightbox = (caseId: string) => {
    setOpenCaseId(caseId);
    setActiveImageIndex(0);
  };

  const closeLightbox = () => {
    setOpenCaseId(null);
    setActiveImageIndex(0);
  };

  return (
    <>
      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-4 md:p-6">
        <div className="no-scrollbar -mx-1 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2 px-1">
            <button
              type="button"
              onClick={() => setActiveFilter("alle")}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                activeFilter === "alle"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white text-foreground"
              }`}
            >
              Alle
            </button>
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveFilter(category.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  activeFilter === category.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white text-foreground"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {visibleCategories.map((category) => {
        const categoryCases = filteredCases.filter((item) => item.category === category.value);
        const beforeAfterCases = categoryCases.filter((item) => item.beforeSrc && item.afterSrc).slice(0, 4);

        return (
          <section key={category.value} className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-5 md:p-7">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{category.label}</h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">{category.subtitle}</p>

            {beforeAfterCases.length ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {beforeAfterCases.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-2xl border border-border/70 bg-white">
                    <div className="grid gap-2 p-2 sm:grid-cols-2 sm:gap-3 sm:p-3">
                      <figure>
                        <figcaption className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Før
                        </figcaption>
                        <button
                          type="button"
                          onClick={() => openLightbox(item.id)}
                          className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl"
                        >
                          <Image
                            src={item.beforeSrc!}
                            alt={`${item.title} før`}
                            fill
                            unoptimized
                            sizes="(max-width: 1023px) 100vw, 40vw"
                            className="object-cover"
                          />
                        </button>
                      </figure>
                      <figure>
                        <figcaption className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Efter
                        </figcaption>
                        <button
                          type="button"
                          onClick={() => openLightbox(item.id)}
                          className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl"
                        >
                          <Image
                            src={item.afterSrc!}
                            alt={`${item.title} efter`}
                            fill
                            unoptimized
                            sizes="(max-width: 1023px) 100vw, 40vw"
                            className="object-cover"
                          />
                        </button>
                      </figure>
                    </div>
                    <div className="border-t border-border/60 px-4 py-3">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-5 md:p-7">
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Galleri</h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {filteredCases.length} cases i visning. Klik på et kort for at åbne hele billedserien.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCases.map((item) => {
            const cover = item.afterSrc ?? item.gallery[0] ?? item.beforeSrc;
            if (!cover) {
              return null;
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openLightbox(item.id)}
                className="group overflow-hidden rounded-[22px] border border-border/70 bg-white text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_36px_hsl(20_30%_20%/0.14)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
                  <Image
                    src={cover}
                    alt={`${item.title} case`}
                    fill
                    unoptimized
                    sizes="(max-width: 767px) 96vw, (max-width: 1279px) 48vw, 32vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  {item.clientLogoSrc ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3">
                      <div className="relative h-[28%] w-[64%] rounded-lg bg-white/72 p-2 shadow-[0_8px_18px_hsl(0_0%_0%/0.18)] ring-1 ring-black/10 backdrop-blur-[1px]">
                        <Image
                          src={item.clientLogoSrc}
                          alt={`${item.title} logo`}
                          fill
                          sizes="30vw"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {labelByCategory[item.category]}
                  </p>
                  <p className="text-base font-semibold text-foreground">{item.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <EnterpriseCaseShowcase
        title="Enterprise references"
        subtitle="Udvalgte erhvervscases med billedserier og kundelogo."
        limit={6}
        cases={enterpriseCases}
      />

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-5 md:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
          <Button asChild className="h-11 px-6">
            <Link href="/bordpladeslibning/book">Book</Link>
          </Button>
          <Button asChild variant="secondary" className="h-11 px-6">
            <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-6">
            <Link href="/referencer">Se referencer</Link>
          </Button>
        </div>
      </section>

      {openCase && activeImage ? (
        <div className="fixed inset-0 z-[80] bg-black/70 p-3 backdrop-blur-sm md:p-6" onClick={closeLightbox}>
          <div
            className="mx-auto flex h-full w-full max-w-6xl flex-col rounded-2xl border border-white/20 bg-neutral-950/95 p-3 text-white md:p-5"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={openCase.title}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/70">
                  {labelByCategory[openCase.category]}
                </p>
                <h3 className="mt-1 text-lg font-semibold md:text-xl">{openCase.title}</h3>
              </div>
              <Button variant="secondary" size="sm" className="h-9 px-3" onClick={closeLightbox}>
                Luk
              </Button>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <Image
                src={activeImage}
                alt={`${openCase.title} billede ${activeImageIndex + 1}`}
                fill
                unoptimized
                sizes="(max-width: 1024px) 95vw, 70vw"
                className="object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setActiveImageIndex((current) =>
                    openCaseImages.length <= 1 ? current : (current - 1 + openCaseImages.length) % openCaseImages.length
                  )
                }
                disabled={openCaseImages.length <= 1}
              >
                Forrige
              </Button>
              <p className="text-xs text-white/70 md:text-sm">
                {activeImageIndex + 1} / {openCaseImages.length}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setActiveImageIndex((current) =>
                    openCaseImages.length <= 1 ? current : (current + 1) % openCaseImages.length
                  )
                }
                disabled={openCaseImages.length <= 1}
              >
                Næste
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
