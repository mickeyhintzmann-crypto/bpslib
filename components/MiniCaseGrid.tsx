import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";
import { getCases } from "@/lib/cases";
import type { CaseItem } from "@/lib/cases-data";

type MiniCaseGridProps = {
  category?: "bordplade" | "gulv" | "andet";
  limit?: number;
  title?: string;
};

const finishLabels: Record<CaseItem["finish"], string> = {
  olie: "Olie",
  lak: "Lak",
  saebe: "Sæbe",
  andet: "Andet"
};

export const MiniCaseGrid = async ({
  category = "bordplade",
  limit = 6,
  title = "Før/efter (cases)"
}: MiniCaseGridProps) => {
  const allCases = await getCases();
  const filteredCases = allCases.filter((item) => item.category === category).slice(0, limit);
  const cta =
    category === "bordplade"
      ? { href: "/bordpladeslibning/prisberegner", label: "Få pris" }
      : { href: "/tilbudstid", label: "Book tilbudstid" };
  const detailLabel = category === "bordplade" ? "Olie-farve" : "Problem";

  return (
    <section className="mt-10 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <Button asChild size="sm" variant="secondary">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </div>

      {filteredCases.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Cases bliver tilføjet løbende, når vi har nye før/efter eksempler klar.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((item) => {
            const hasAfter = Boolean(item.afterImage);

            return (
            <article key={item.id} className="rounded-3xl border border-border/70 bg-white/80 p-5">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground">Lokation: {item.location}</p>
              </div>
              <div className={`mt-4 grid gap-3 ${hasAfter ? "grid-cols-2" : "grid-cols-1"}`}>
                <figure className="space-y-2">
                  <BpsImage
                    src={item.beforeImage}
                    alt={item.beforeAlt}
                    width={1200}
                    height={900}
                    className="h-28 w-full rounded-xl object-cover"
                  />
                  <figcaption className="text-xs text-muted-foreground">
                    {hasAfter ? "Før" : "Eksempel"}
                  </figcaption>
                </figure>
                {hasAfter ? (
                  <figure className="space-y-2">
                    <BpsImage
                      src={item.afterImage || item.beforeImage}
                      alt={item.afterAlt || item.beforeAlt}
                      width={1200}
                      height={900}
                      className="h-28 w-full rounded-xl object-cover"
                    />
                    <figcaption className="text-xs text-muted-foreground">Efter</figcaption>
                  </figure>
                ) : null}
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">{detailLabel}:</span> {item.problem}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Finish:</span> {finishLabels[item.finish]}
                </p>
              </div>
            </article>
          );
          })}
        </div>
      )}
    </section>
  );
};
