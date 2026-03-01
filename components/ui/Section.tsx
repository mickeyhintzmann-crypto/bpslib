import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  eyebrow?: string;
};

export const Section = ({ children, className, innerClassName, eyebrow }: SectionProps) => {
  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className={cn("mx-auto w-full max-w-6xl px-4", innerClassName)}>
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
};
