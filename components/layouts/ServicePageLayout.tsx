import { type ReactNode } from "react";
import Link from "next/link";

import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { Callout } from "@/components/ui/Callout";
import { CTABox } from "@/components/ui/CTABox";
import { FeatureList } from "@/components/ui/FeatureList";
import { Button } from "@/components/ui/button";
import { ClientLogoWall } from "@/components/trust/ClientLogoWall";

type CtaAction = {
  label: string;
  href: string;
};

type FaqItem = {
  q: string;
  a: string;
};

type ServicePageLayoutProps = {
  title: string;
  subtitle?: string;
  bullets?: string[];
  primaryCta: CtaAction;
  secondaryCta?: CtaAction;
  children: ReactNode;
  faq?: FaqItem[];
  showInternalLinks?: boolean;
};

export const ServicePageLayout = ({
  title,
  subtitle,
  bullets = [],
  primaryCta,
  secondaryCta,
  children,
  faq = [],
  showInternalLinks = false
}: ServicePageLayoutProps) => {
  return (
    <main className="pb-20">
      <Section className="pb-8 pt-12 md:pb-10 md:pt-16">
        <div className="grid items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="surface-panel grain-overlay relative overflow-hidden rounded-[30px] p-6 md:p-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 left-20 h-36 w-36 rounded-full bg-secondary/80 blur-2xl"
            />

            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
                {subtitle}
              </p>
            ) : null}

            {bullets.length ? (
              <FeatureList items={bullets.slice(0, 4)} className="mt-6 max-w-2xl gap-3.5 text-[15px]" />
            ) : null}

            <div className="mt-7 flex flex-wrap gap-3">
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

          <aside className="grid gap-4">
            <section className="surface-subtle rounded-[26px] p-6 md:p-7">
              <ul className="space-y-3.5">
                {(bullets.length ? bullets : [primaryCta.label]).slice(0, 4).map((point, index) => (
                  <li key={`${point}-${index}`} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/80 bg-white/80 text-xs font-semibold text-foreground">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-foreground/90">{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="surface-panel rounded-[26px] p-6 md:p-7">
              <div className="flex flex-wrap gap-2.5">
                <Button asChild size="sm" className="h-10 px-5">
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
                {secondaryCta ? (
                  <Button asChild size="sm" variant="outline" className="h-10 px-5">
                    <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                  </Button>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </Section>

      <ClientLogoWall variant="compact" />

      <Section className="py-7 md:py-9">
        <div className="space-y-9 [&_.reference-strip]:hidden">{children}</div>
      </Section>

      {showInternalLinks ? (
        <Section className="py-7 md:py-9">
          <Callout title="Se også" className="surface-subtle rounded-[26px] p-6 md:p-8">
            <p>
              Dyk videre i relevante guides og cases for at sammenligne løsninger og planlægge
              næste skridt.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
              <Link href="/guides" className="text-foreground hover:text-primary">
                Guides & råd
              </Link>
              <Link href="/cases" className="text-foreground hover:text-primary">
                Cases
              </Link>
            </div>
          </Callout>
        </Section>
      ) : null}

      {faq.length ? (
        <Section className="py-7 md:py-9">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Ofte stillede spørgsmål</h2>
            <Accordion
              items={faq.map((item) => ({
                title: item.q,
                content: item.a
              }))}
            />
          </section>
        </Section>
      ) : null}

      <Section className="py-7 md:py-9">
        <CTABox
          title="Klar til næste skridt?"
          description="Send kort beskrivelse og billeder, så vender vi tilbage med et konkret forslag til forløb og næste handling."
          primaryCta={primaryCta}
          secondaryCta={secondaryCta}
        />
      </Section>
    </main>
  );
};
