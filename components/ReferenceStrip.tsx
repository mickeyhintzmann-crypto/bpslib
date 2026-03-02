import { references } from "@/lib/references";

type ReferenceStripProps = {
  compact?: boolean;
};

export const ReferenceStrip = ({ compact = false }: ReferenceStripProps) => {
  return (
    <section
      className={[
        "reference-strip",
        compact ? "mt-6 rounded-2xl border border-border/70 bg-white/55 px-4 py-4 md:px-5" : "surface-panel mt-8 rounded-3xl p-6 md:p-8"
      ].join(" ")}
      aria-labelledby="references-title"
    >
      <h2
        id="references-title"
        className={compact ? "text-base font-semibold text-foreground" : "text-2xl font-semibold text-foreground"}
      >
        Udført for anerkendte kunder
      </h2>
      <p className={compact ? "mt-1.5 text-xs text-muted-foreground md:text-sm" : "mt-3 text-sm text-muted-foreground md:text-base"}>
        Erfaring fra større projekter - samme kvalitet i private hjem.
      </p>
      <ul className={compact ? "mt-3 flex flex-wrap gap-1.5 md:gap-2" : "mt-4 flex flex-wrap gap-2 md:gap-3"}>
        {references.map((name) => (
          <li
            key={name}
            className={compact ? "rounded-full border border-border/70 bg-white px-3 py-1 text-[11px] font-medium text-foreground md:text-xs" : "rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground md:text-sm"}
          >
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
};
