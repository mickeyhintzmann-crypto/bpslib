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
        <details key={item.title} className="group rounded-2xl border border-border/70 bg-white/75 p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground marker:content-none">
            <span>{item.title}</span>
            <span
              aria-hidden="true"
              className="text-base text-muted-foreground transition group-open:rotate-45"
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
