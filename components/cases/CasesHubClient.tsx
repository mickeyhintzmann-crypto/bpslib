"use client";

import { useEffect, useMemo, useState } from "react";
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

const categories: { value: CasesManifestCategory; label: string; subtitle: string; href: string }[] = [
  {
    value: "bordplade",
    label: "Bordplader",
    subtitle: "Massiv træ – før/efter og afsluttet resultat",
    href: "/bordpladeslibning/cases"
  },
  {
    value: "gulvafslibning",
    label: "Gulvafslibning",
    subtitle: "Trægulve med synlig forskel før og efter",
    href: "/gulvafslibning/cases"
  },
  {
    value: "gulvbelaegning",
    label: "Gulvbelægning",
    subtitle: "Sildeben, parket, vinyl og øvrige løsninger",
    href: "/gulvlaegning/cases"
  }
];

const labelByCategory: Record<CasesManifestCategory, string> = {
  bordplade: "Bordplader",
  gulvafslibning: "Gulvafslibning",
  gulvbelaegning: "Gulvbelægning"
};

const dedupe = (items: string[]) => [...new Set(items.filter(Boolean))];

export const CasesHubClient = ({ cases, enterpriseCases }: CasesHubClientProps) => {
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const openCase = useMemo(() => cases.find((item) => item.id === openCaseId) ?? null, [cases, openCaseId]);

  const openCaseImages = useMemo(() => {
    if (!openCase) {
      return [];
    }
    return dedupe([openCase.frontSrc ?? "", ...(openCase.gallery ?? []), openCase.afterSrc ?? "", openCase.beforeSrc ?? ""]);
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

  useEffect(() => {
    if (!openCase) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft" && openCaseImages.length > 1) {
        setActiveImageIndex((current) => (current - 1 + openCaseImages.length) % openCaseImages.length);
      }

      if (event.key === "ArrowRight" && openCaseImages.length > 1) {
        setActiveImageIndex((current) => (current + 1) % openCaseImages.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openCase, openCaseImages.length]);

  return (
    <>
      {categories.map((category) => {
        const categoryCases = cases.filter((item) => item.category === category.value);
        const previewCases = categoryCases.filter((item) => item.beforeSrc && item.afterSrc).slice(0, 4);

        return (
          <section key={category.value} className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-5 md:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{category.label}</h2>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">{category.subtitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">{categoryCases.length} cases i alt</p>
              </div>
              <Button asChild variant="outline" className="h-10 px-4">
                <Link href={category.href}>Se flere</Link>
              </Button>
            </div>

            {previewCases.length ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {previewCases.map((item) => (
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
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Ingen før/efter-cases til visning endnu.</p>
            )}
          </section>
        );
      })}

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
        <div
          className="fixed inset-0 z-[80] bg-black/70 p-3 backdrop-blur-sm animate-in fade-in duration-200 md:p-6"
          onClick={closeLightbox}
        >
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

            {openCaseImages.length > 1 ? (
              <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {openCaseImages.map((imageSrc, index) => (
                  <li key={imageSrc}>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-14 w-20 overflow-hidden rounded-md border transition ${
                        index === activeImageIndex ? "border-white" : "border-white/35"
                      }`}
                    >
                      <Image
                        src={imageSrc}
                        alt={`${openCase.title} thumbnail ${index + 1}`}
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};
