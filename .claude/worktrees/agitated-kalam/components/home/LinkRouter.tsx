import Link from "next/link";

import { featuredRoutes } from "@/lib/site-registry";

export const LinkRouter = () => {
  const links = featuredRoutes;

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-border/70 bg-gradient-to-br from-white via-white to-primary/10 px-6 py-8 shadow-[0_18px_38px_hsl(20_30%_20%/0.08)] md:px-10 md:py-10">
      <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-36 w-36 rounded-full bg-primary/8 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="max-w-xl space-y-3">
          <p className="inline-flex rounded-full border border-primary/25 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Hurtige genveje
          </p>
          <h2 className="text-2xl font-semibold leading-tight text-foreground md:text-[2rem]">
            Fortsæt i bordplade‑universet
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Brug genvejene til de vigtigste sider om pris, finish og de mest efterspurgte emner.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 md:max-w-[480px]">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between rounded-xl border border-border/80 bg-white/90 px-4 py-2.5 text-sm font-medium text-foreground shadow-[0_8px_16px_hsl(20_30%_20%/0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white hover:shadow-[0_12px_22px_hsl(20_30%_20%/0.1)]"
            >
              <span>{item.label}</span>
              <span className="text-base leading-none text-primary transition group-hover:translate-x-0.5">
                ›
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
