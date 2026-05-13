"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import type { EnterpriseCase } from "@/lib/enterpriseCases";
import { Button } from "@/components/ui/button";

type EnterpriseCaseLightboxProps = {
  isOpen: boolean;
  onClose: () => void;
  caseItem: EnterpriseCase | null;
};

export const EnterpriseCaseLightbox = ({
  isOpen,
  onClose,
  caseItem
}: EnterpriseCaseLightboxProps) => {
  const images = caseItem?.imageSrcs ?? [];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [caseItem?.id]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowRight" && images.length > 1) {
        setActiveIndex((current) => (current + 1) % images.length);
      }

      if (event.key === "ArrowLeft" && images.length > 1) {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, isOpen, onClose]);

  const activeImage = useMemo(() => {
    if (!images.length) {
      return null;
    }
    return images[activeIndex] ?? images[0];
  }, [activeIndex, images]);

  if (!isOpen || !caseItem || !activeImage) {
    return null;
  }

  const goPrev = () => {
    if (images.length <= 1) {
      return;
    }
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  const goNext = () => {
    if (images.length <= 1) {
      return;
    }
    setActiveIndex((current) => (current + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={caseItem.title}
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-5xl flex-col rounded-2xl border border-white/20 bg-neutral-950/95 p-4 text-white md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">{caseItem.clientName}</p>
            <h3 className="mt-1 text-lg font-semibold md:text-xl">{caseItem.title}</h3>
          </div>
          <Button variant="secondary" size="sm" className="h-9 px-3" onClick={onClose}>
            Luk
          </Button>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <Image
            src={activeImage}
            alt={`${caseItem.clientName} reference ${activeIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 95vw, 70vw"
            className="object-contain"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button variant="secondary" size="sm" onClick={goPrev} disabled={images.length <= 1}>
            Forrige
          </Button>
          <p className="text-xs text-white/70 md:text-sm">
            {activeIndex + 1} / {images.length}
          </p>
          <Button variant="secondary" size="sm" onClick={goNext} disabled={images.length <= 1}>
            Næste
          </Button>
        </div>

        {images.length > 1 ? (
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((src, index) => (
              <li key={src}>
                <button
                  type="button"
                  className={`relative h-14 w-20 overflow-hidden rounded-md border ${
                    index === activeIndex ? "border-white" : "border-white/30"
                  }`}
                  onClick={() => setActiveIndex(index)}
                >
                  <Image
                    src={src}
                    alt={`${caseItem.clientName} thumbnail ${index + 1}`}
                    fill
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
  );
};
