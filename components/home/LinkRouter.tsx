import Link from "next/link";

import { featuredRoutes } from "@/lib/site-registry";

export const LinkRouter = () => {
  const links = featuredRoutes;

  return (
    <section className="rounded-3xl border border-border/70 bg-white/70 px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Hurtige links til bordplader</h2>
          <p className="text-sm text-muted-foreground">
            Brug genvejene her for at komme direkte til pris, booking eller akutte tider.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
