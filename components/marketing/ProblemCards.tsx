import { Section } from "@/components/ui/Section";

type ProblemCardItem = {
  title: string;
  description: string;
};

type ProblemCardsProps = {
  title: string;
  subtitle?: string;
  items: ProblemCardItem[];
};

const icons = [
  <svg key="spark" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
  </svg>,
  <svg key="wood" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <path d="M8 9c2 0 2-2 4-2s2 2 4 2" />
    <path d="M8 13h8" />
  </svg>,
  <svg key="tools" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 20l6-6" />
    <path d="M14 4l6 6-2 2-6-6 2-2z" />
    <path d="M6 14l4 4" />
  </svg>,
  <svg key="water" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 4s5 5.2 5 8.4A5 5 0 017 12.4C7 9.2 12 4 12 4z" />
  </svg>,
  <svg key="fire" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3s3 2.6 3 5.2c0 1.3-.6 2.2-1.5 3 .6-2.6-1-4.4-3-5.8C8.8 6.8 8 8.5 8 10.6A4.8 4.8 0 0012.8 16 4.2 4.2 0 0017 11.8C17 7.9 12 3 12 3z" />
  </svg>
];

export const ProblemCards = ({ title, subtitle, items }: ProblemCardsProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <Section className="py-6 md:py-8">
      <section>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <article
              key={item.title}
              className="rounded-3xl border border-border/70 bg-white/80 p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground">
                {icons[index % icons.length]}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </Section>
  );
};
