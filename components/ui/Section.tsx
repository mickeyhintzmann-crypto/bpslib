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
    <section className={cn("py-10 md:py-14", className)}>
      <div className={cn("mx-auto w-full max-w-[1180px] px-4 md:px-6", innerClassName)}>
        {eyebrow ? (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
};
