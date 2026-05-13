import Link from "next/link";

import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";

type MidPageCTAProps = {
  title: string;
  subtitle: string;
  primary: {
    label: string;
    href: string;
  };
  secondary?: {
    label: string;
    href: string;
  };
};

export const MidPageCTA = ({ title, subtitle, primary, secondary }: MidPageCTAProps) => {
  return (
    <Section className="py-7 md:py-9">
      <section className="surface-panel relative overflow-hidden rounded-[30px] p-6 md:p-9">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-primary/10 blur-2xl"
        />
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {subtitle}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 px-6">
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary ? (
            <Button asChild size="lg" variant="secondary" className="h-12 px-6">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          ) : null}
        </div>
      </section>
    </Section>
  );
};
