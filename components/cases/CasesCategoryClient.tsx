"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CasesManifestCategory, CasesManifestItem } from "@/lib/mediaManifest";

type CasesCategoryClientProps = {
  cases: CasesManifestItem[];
  category: CasesManifestCategory;
  title: string;
  subtitle: string;
};

const labelByCategory: Record<CasesManifestCategory, string> = {
  bordplade: "Bordplader",
  gulvafslibning: "Gulvafslibning",
  gulvbelaegning: "Gulvbelægning"
};

const dedupe = (items: string[]) => [...new Set(items.filter(Boolean))];

export const CasesCategoryClient = ({ cases, category, title, subtitle }: CasesCategoryClientProps) => {
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const openCase = useMemo(() => cases.find((item) => item.id === openCaseId) ?? null, [cases, openCaseId]);

  const openCaseImages = useMemo(() => {
    if (!openCase) {
      return [];
    }
    return dedupe([...(openCase.gallery ?? []), openCase.afterSrc ?? "", openCase.beforeSrc ?? ""]);
  }, [openCase]);

  const activeImage = openCaseImages[activeImageIndex] ?? null;

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
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">{subtitle}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/cases">Tilbage til alle fag</Link>
          </Button>
          <Button asChild>
            <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-5 md:p-7">
        <p className="text-sm text-muted-foreground md:text-base">
          {cases.length} {labelByCategory[category].toLowerCase()}-cases i visning. Klik på et kort for at åbne hele billedserien.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((item) => {
            const cover = item.afterSrc ?? item.gallery[0] ?? item.beforeSrc;
            if (!cover) {
              return null;
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setOpenCaseId(item.id);
                  setActiveImageIndex(0);
                }}
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
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {labelByCategory[item.category]}
                  </p>
                  <p className="text-base font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.gallery.length} billeder</p>
                </div>
              </button>
            );
          })}
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
