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
    <main className="pb-16">
      <Section className="pb-6 pt-10 md:pb-8 md:pt-14">
        <section className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {subtitle}
            </p>
          ) : null}
          {bullets.length ? <FeatureList items={bullets.slice(0, 4)} className="mt-5" /> : null}
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
      </Section>

      <ClientLogoWall />

      <Section className="py-6 md:py-8">
        <div className="space-y-8 [&_.reference-strip]:hidden">{children}</div>
      </Section>

      {showInternalLinks ? (
        <Section className="py-6 md:py-8">
          <Callout title="Se også">
            <p>
              Dyk videre i relevante guides og cases for at sammenligne løsninger og planlægge
              næste skridt.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
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
        <Section className="py-6 md:py-8">
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

      <Section className="py-6 md:py-8">
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
