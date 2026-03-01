import { references } from "@/lib/references";

type ReferenceStripProps = {
  compact?: boolean;
};

export const ReferenceStrip = ({ compact = false }: ReferenceStripProps) => {
  return (
    <section
      className={[
        "rounded-3xl border border-border/70 bg-white/70",
        compact ? "mt-6 p-4 md:p-5" : "mt-8 p-6 md:p-8"
      ].join(" ")}
      aria-labelledby="references-title"
    >
      <h2
        id="references-title"
        className={compact ? "text-xl font-semibold text-foreground" : "text-2xl font-semibold text-foreground"}
      >
        Udført for anerkendte kunder
      </h2>
      <p className={compact ? "mt-2 text-sm text-muted-foreground" : "mt-3 text-sm text-muted-foreground md:text-base"}>
        Erfaring fra større projekter - samme kvalitet i private hjem.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2 md:gap-3">
        {references.map((name) => (
          <li
            key={name}
            className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground md:text-sm"
          >
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
};
