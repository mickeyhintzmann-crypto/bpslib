import { cn } from "@/lib/utils";

type AccordionItem = {
  title: string;
  content: string;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

export const Accordion = ({ items, className }: AccordionProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <div className={cn("grid gap-3", className)}>
      {items.map((item) => (
        <details
          key={item.title}
          className="group surface-subtle rounded-2xl p-4 transition duration-300 hover:shadow-[0_12px_28px_hsl(20_30%_20%/0.1)]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground marker:content-none">
            <span>{item.title}</span>
            <span
              aria-hidden="true"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-white/80 text-base text-muted-foreground transition group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.content}</p>
        </details>
      ))}
    </div>
  );
};
