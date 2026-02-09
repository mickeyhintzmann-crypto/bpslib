"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";
import type { CaseItem } from "@/lib/cases-data";

type TabKey = "bordplade" | "gulv" | "andet";

type CasesTabsProps = {
  cases: CaseItem[];
};

const tabLabels: Record<TabKey, string> = {
  bordplade: "Bordplade",
  gulv: "Gulv",
  andet: "Andre fag"
};

const finishLabels: Record<CaseItem["finish"], string> = {
  olie: "Olie",
  lak: "Lak",
  saebe: "Sæbe",
  andet: "Andet"
};

const emptyMessages: Record<TabKey, string> = {
  bordplade: "Ingen bordplade-cases er tilføjet endnu.",
  gulv: "Gulv-cases publiceres, når vi har samlet de første før/efter eksempler.",
  andet: "Cases for andre fag kommer senere i MVP. Kontakt os for konkrete eksempler."
};

export const CasesTabs = ({ cases }: CasesTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("bordplade");

  const filteredCases = useMemo(
    () => cases.filter((item) => item.category === activeTab),
    [activeTab, cases]
  );

  const cta = activeTab === "bordplade"
    ? { href: "/bordpladeslibning/prisberegner", label: "Få pris" }
    : { href: "/tilbudstid", label: "Book tilbudstid" };

  return (
    <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(tabLabels) as TabKey[]).map((tab) => {
          const isActive = tab === activeTab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
              aria-pressed={isActive}
            >
              {tabLabels[tab]}
            </button>
          );
        })}
      </div>

      {filteredCases.length > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((item) => (
            <article key={item.id} className="rounded-3xl border border-border/70 bg-white/80 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">Lokation: {item.location}</p>
                </div>
                <Button asChild size="sm" variant="secondary">
                  <Link href={cta.href}>{cta.label}</Link>
                </Button>
              </div>
              {item.afterImage ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <figure className="space-y-2">
                    <BpsImage
                      src={item.beforeImage}
                      alt={item.beforeAlt}
                      width={1200}
                      height={900}
                      className="h-32 w-full rounded-xl object-cover"
                    />
                    <figcaption className="text-xs text-muted-foreground">Før</figcaption>
                  </figure>
                  <figure className="space-y-2">
                    <BpsImage
                      src={item.afterImage}
                      alt={item.afterAlt || item.beforeAlt}
                      width={1200}
                      height={900}
                      className="h-32 w-full rounded-xl object-cover"
                    />
                    <figcaption className="text-xs text-muted-foreground">Efter</figcaption>
                  </figure>
                </div>
              ) : (
                <div className="mt-4">
                  <figure className="space-y-2">
                    <BpsImage
                      src={item.beforeImage}
                      alt={item.beforeAlt}
                      width={1200}
                      height={900}
                      className="h-56 w-full rounded-xl object-cover"
                    />
                    <figcaption className="text-xs text-muted-foreground">Eksempel</figcaption>
                  </figure>
                </div>
              )}
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Problem:</span> {item.problem}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Finish:</span> {finishLabels[item.finish]}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">{emptyMessages[activeTab]}</p>
        </div>
      )}
    </section>
  );
};
