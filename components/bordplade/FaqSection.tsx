import type { FaqSchemaItem } from "@/components/seo/StructuredData";

type FaqSectionProps = {
  title?: string;
  intro?: string;
  items: FaqSchemaItem[];
};

export const FaqSection = ({
  title = "Ofte stillede spørgsmål",
  intro = "Her får du korte og konkrete svar på de vigtigste spørgsmål.",
  items
}: FaqSectionProps) => {
  return (
    <section className="py-10 md:py-16">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{intro}</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.question} className="rounded-2xl border border-border/70 bg-white/70 p-5">
            <h3 className="text-base font-semibold text-foreground">{item.question}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
