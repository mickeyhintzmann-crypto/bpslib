"use client";

import { useMemo, useState } from "react";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";
import {
  oilColorOptions,
  woodTypeOptions,
  type FinishGalleryItem,
  type OilColor,
  type WoodType
} from "@/lib/finish-gallery-data";

type FilterValue<T> = T | "all";

type FinishGalleryClientProps = {
  items: FinishGalleryItem[];
};

const ALL_LABEL = "Alle";

const labelForWood = (value: WoodType) =>
  woodTypeOptions.find((option) => option.value === value)?.label || value;

const labelForOil = (value: OilColor) =>
  oilColorOptions.find((option) => option.value === value)?.label || value;

export const FinishGalleryClient = ({ items }: FinishGalleryClientProps) => {
  const [woodType, setWoodType] = useState<FilterValue<WoodType>>("all");
  const [oilColor, setOilColor] = useState<FilterValue<OilColor>>("all");
  const [activeItem, setActiveItem] = useState<FinishGalleryItem | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const woodMatch = woodType === "all" || item.woodType === woodType;
      const oilMatch = oilColor === "all" || item.oilColor === oilColor;
      return woodMatch && oilMatch;
    });
  }, [items, oilColor, woodType]);

  const resetFilters = () => {
    setWoodType("all");
    setOilColor("all");
  };

  return (
    <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Galleri</h2>
          <p className="text-sm text-muted-foreground">
            Filtrer på træsort og olie-farve. {filteredItems.length} resultater.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Nulstil
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Træsort</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setWoodType("all")}
              className={`rounded-full border px-3 py-1 text-sm ${
                woodType === "all" ? "border-primary bg-primary/10 text-primary" : "border-border"
              }`}
            >
              {ALL_LABEL}
            </button>
            {woodTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setWoodType(option.value)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  woodType === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Olie-farve</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOilColor("all")}
              className={`rounded-full border px-3 py-1 text-sm ${
                oilColor === "all" ? "border-primary bg-primary/10 text-primary" : "border-border"
              }`}
            >
              {ALL_LABEL}
            </button>
            {oilColorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setOilColor(option.value)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  oilColor === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveItem(item)}
            className="group rounded-2xl border border-border/70 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <BpsImage
                src={item.image}
                alt={item.alt}
                width={640}
                height={480}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <div className="space-y-2 p-4">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {labelForWood(item.woodType)} · {labelForOil(item.oilColor)}
              </p>
              {item.note ? <p className="text-xs text-muted-foreground">{item.note}</p> : null}
              {item.location ? <p className="text-xs text-muted-foreground">{item.location}</p> : null}
            </div>
          </button>
        ))}
      </div>

      {activeItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <button
            type="button"
            aria-label="Luk galleri"
            onClick={() => setActiveItem(null)}
            className="absolute inset-0"
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="absolute right-4 top-4 rounded-full border border-border px-3 py-1 text-xs font-semibold"
            >
              Luk
            </button>
            <div className="space-y-3 pt-6">
              <BpsImage
                src={activeItem.image}
                alt={activeItem.alt}
                width={960}
                height={720}
                className="h-auto w-full rounded-xl object-cover"
              />
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">{activeItem.title}</p>
                <p className="text-sm text-muted-foreground">
                  {labelForWood(activeItem.woodType)} · {labelForOil(activeItem.oilColor)}
                </p>
                {activeItem.note ? <p className="text-sm text-muted-foreground">{activeItem.note}</p> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
