import { cn } from "@/lib/utils";

type FeatureListProps = {
  items: string[];
  className?: string;
};

export const FeatureList = ({ items, className }: FeatureListProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <ul className={cn("grid gap-3 text-sm text-muted-foreground", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 12l4 4 8-8" />
            </svg>
          </span>
          <span className="pt-0.5">{item}</span>
        </li>
      ))}
    </ul>
  );
};
