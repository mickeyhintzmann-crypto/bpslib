import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";

type CaseGalleryItem = {
  title: string;
  location?: string;
  summary: string;
  image?: {
    src: string;
    alt: string;
  };
};

type CaseGalleryProps = {
  title: string;
  subtitle?: string;
  items: CaseGalleryItem[];
  cta?: {
    label: string;
    href: string;
  };
};

export const CaseGallery = ({ title, subtitle, items, cta }: CaseGalleryProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <Section className="py-7 md:py-9">
      <section>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article
              key={`${item.title}-${item.location ?? "default"}`}
              className="group surface-subtle overflow-hidden rounded-[26px] p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_hsl(20_30%_20%/0.12)] md:p-5"
            >
              {item.image ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4">
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-white/70"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
                        <circle cx="9" cy="10" r="1.4" />
                        <path d="M6 17l4-4 3 3 2-2 3 3" />
                      </svg>
                    </span>
                    <p className="mt-2 text-sm font-semibold text-foreground">Billede på vej</p>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                      Vi tilføjer før/efter når vi har de næste cases klar
                    </p>
                  </div>
                </div>
              )}

              <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
              {item.location ? (
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.location}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
            </article>
          ))}
        </div>

        {cta ? (
          <div className="mt-6">
            <Button asChild size="lg" className="h-12 px-6">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          </div>
        ) : null}
      </section>
    </Section>
  );
};
