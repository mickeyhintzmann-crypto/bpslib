import { references } from "@/lib/references";

type ReferenceStripProps = {
  compact?: boolean;
};

export const ReferenceStrip = ({ compact = false }: ReferenceStripProps) => {
  return (
    <section
      className={[
        "reference-strip",
        compact
          ? "mt-6 rounded-3xl border border-stone-200/90 bg-[linear-gradient(140deg,hsl(32_35%_98%),hsl(220_26%_97%))] px-5 py-5 shadow-[0_18px_34px_hsl(20_20%_20%/0.08)] md:px-7 md:py-6"
          : "surface-panel mt-8 rounded-3xl border border-stone-200/80 bg-[linear-gradient(140deg,hsl(32_35%_98%),hsl(220_26%_97%))] p-6 shadow-[0_18px_34px_hsl(20_20%_20%/0.08)] md:p-8"
      ].join(" ")}
      aria-labelledby="references-title"
    >
      <div className={compact ? "flex flex-col gap-3 md:flex-row md:items-end md:justify-between" : "space-y-3"}>
        <div>
          <h2
            id="references-title"
            className={compact ? "text-lg font-semibold text-foreground md:text-xl" : "text-2xl font-semibold text-foreground"}
          >
            Udført for anerkendte kunder
          </h2>
          <p
            className={
              compact ? "mt-1.5 text-sm text-muted-foreground md:text-base" : "mt-1.5 text-sm text-muted-foreground md:text-base"
            }
          >
            Erfaring fra større projekter - samme kvalitet i private hjem.
          </p>
        </div>
        {compact ? (
          <span className="inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Enterprise referencer
          </span>
        ) : null}
      </div>
      <ul className={compact ? "mt-4 flex flex-wrap gap-2" : "mt-4 flex flex-wrap gap-2.5"}>
        {references.map((name) => (
          <li
            key={name}
            className={
              compact
                ? "rounded-full border border-stone-200 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-[0_6px_12px_hsl(20_20%_20%/0.05)]"
                : "rounded-full border border-stone-200 bg-white/90 px-4 py-1.5 text-sm font-medium text-foreground shadow-[0_6px_12px_hsl(20_20%_20%/0.05)]"
            }
          >
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
};
