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
    <section className={cn("rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8", className)}>
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-11 px-6">
          <Link href={primaryCta.href}>{primaryCta.label}</Link>
        </Button>
        {secondaryCta ? (
          <Button asChild size="lg" variant="secondary" className="h-11 px-6">
            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
};
