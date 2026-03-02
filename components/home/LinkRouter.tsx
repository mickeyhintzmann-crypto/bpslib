import Link from "next/link";

import { featuredRoutes } from "@/lib/site-registry";

export const LinkRouter = () => {
  const links = featuredRoutes;

  return (
    <section className="surface-panel rounded-[30px] px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Fortsæt i bordplade‑universet</h2>
          <p className="text-sm text-muted-foreground">
            Brug genvejene til de vigtigste sider om pris, finish og de mest efterspurgte emner.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
