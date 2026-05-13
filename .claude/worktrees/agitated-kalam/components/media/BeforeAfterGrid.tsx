import Image from "next/image";

import { Section } from "@/components/ui/Section";

type BeforeAfterGridItem = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
};

type BeforeAfterGridProps = {
  title: string;
  items: BeforeAfterGridItem[];
};

export const BeforeAfterGrid = ({ title, items }: BeforeAfterGridProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <Section className="py-7 md:py-9">
      <section>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <article
              key={`${item.beforeSrc}-${item.afterSrc}-${index}`}
              className="surface-subtle rounded-[26px] p-4 md:p-5"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <figure>
                  <figcaption className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Før
                  </figcaption>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                    <Image
                      src={item.beforeSrc}
                      alt={item.beforeAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized
                    />
                  </div>
                </figure>

                <figure>
                  <figcaption className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Efter
                  </figcaption>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                    <Image
                      src={item.afterSrc}
                      alt={item.afterAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized
                    />
                  </div>
                </figure>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Section>
  );
};
