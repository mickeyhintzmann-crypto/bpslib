import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CtaAction = {
  label: string;
  href: string;
};

type CTABoxProps = {
  title: string;
  description: string;
  primaryCta: CtaAction;
  secondaryCta?: CtaAction;
  className?: string;
};

export const CTABox = ({ title, description, primaryCta, secondaryCta, className }: CTABoxProps) => {
  return (
    <section
      className={cn(
        "surface-panel relative overflow-hidden rounded-[30px] p-6 md:p-9",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 top-0 h-36 w-36 rounded-full bg-primary/10 blur-2xl"
      />
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-12 px-6">
          <Link href={primaryCta.href}>{primaryCta.label}</Link>
        </Button>
        {secondaryCta ? (
          <Button asChild size="lg" variant="secondary" className="h-12 px-6">
            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
};
