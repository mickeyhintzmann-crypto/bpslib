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
            className="mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full bg-primary/80"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};
