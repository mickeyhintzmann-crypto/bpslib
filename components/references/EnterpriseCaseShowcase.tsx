"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { Section } from "@/components/ui/Section";
import { enterpriseCases, type EnterpriseCase } from "@/lib/enterpriseCases";
import { EnterpriseCaseLightbox } from "@/components/references/EnterpriseCaseLightbox";

type EnterpriseCaseShowcaseProps = {
  title: string;
  subtitle?: string;
  limit?: number;
  cases?: EnterpriseCase[];
};

export const EnterpriseCaseShowcase = ({
  title,
  subtitle,
  limit,
  cases = enterpriseCases
}: EnterpriseCaseShowcaseProps) => {
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);

  const visibleCases = useMemo(() => {
    if (typeof limit === "number") {
      return cases.slice(0, limit);
    }
    return cases;
  }, [cases, limit]);

  const openCase = useMemo(
    () => visibleCases.find((caseItem) => caseItem.id === openCaseId) ?? null,
    [openCaseId, visibleCases]
  );

  if (!visibleCases.length) {
    return null;
  }

  return (
    <Section className="py-8 md:py-10">
      <section>
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h2>
        {subtitle ? (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {subtitle}
          </p>
        ) : null}

        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleCases.map((caseItem) => (
            <li key={caseItem.id}>
              <button
                type="button"
                className="group surface-subtle w-full overflow-hidden rounded-[24px] text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_36px_hsl(20_30%_20%/0.14)]"
                onClick={() => setOpenCaseId(caseItem.id)}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
                  <Image
                    src={caseItem.coverSrc}
                    alt={caseItem.title}
                    fill
                    sizes="(max-width: 767px) 95vw, (max-width: 1023px) 46vw, 30vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                  {caseItem.clientLogoSrc ? (
                    <div className="absolute left-3 top-3 rounded-md border border-white/40 bg-white/90 p-1.5 shadow-sm">
                      <Image
                        src={caseItem.clientLogoSrc}
                        alt={`${caseItem.clientName} logo`}
                        width={90}
                        height={36}
                        sizes="90px"
                        className="h-auto max-h-7 w-auto object-contain"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {caseItem.clientName}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-foreground md:text-lg">{caseItem.title}</h3>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <EnterpriseCaseLightbox
        isOpen={Boolean(openCase)}
        onClose={() => setOpenCaseId(null)}
        caseItem={openCase}
      />
    </Section>
  );
};
