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

const cardToneClasses = [
  "border-amber-300/90 bg-gradient-to-br from-amber-100/90 via-amber-50/85 to-orange-100/80",
  "border-sky-300/90 bg-gradient-to-br from-sky-100/90 via-sky-50/85 to-cyan-100/80",
  "border-emerald-300/90 bg-gradient-to-br from-emerald-100/90 via-emerald-50/85 to-teal-100/80",
  "border-rose-300/90 bg-gradient-to-br from-rose-100/90 via-rose-50/85 to-orange-100/80"
] as const;

const haloToneClasses = [
  "bg-amber-400/40 group-hover:bg-amber-400/60",
  "bg-sky-400/40 group-hover:bg-sky-400/60",
  "bg-emerald-400/40 group-hover:bg-emerald-400/60",
  "bg-rose-400/40 group-hover:bg-rose-400/60"
] as const;

const iconToneClasses = [
  "border-amber-300/90 bg-amber-100/95 text-amber-800",
  "border-sky-300/90 bg-sky-100/95 text-sky-800",
  "border-emerald-300/90 bg-emerald-100/95 text-emerald-800",
  "border-rose-300/90 bg-rose-100/95 text-rose-800"
] as const;

export const ProblemCards = ({ title, subtitle, items }: ProblemCardsProps) => {
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
          {items.map((item, index) => {
            const toneIndex = index % cardToneClasses.length;

            return (
              <article
                key={item.title}
                className={`group relative overflow-hidden rounded-[26px] border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_hsl(20_30%_20%/0.12)] md:p-6 ${cardToneClasses[toneIndex]}`}
              >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-xl transition ${haloToneClasses[toneIndex]}`}
              />
              <div
                className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border ${iconToneClasses[toneIndex]}`}
              >
                {icons[index % icons.length]}
              </div>
              <h3 className="relative mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              </article>
            );
          })}
        </div>
      </section>
    </Section>
  );
};
