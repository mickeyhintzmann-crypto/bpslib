import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";
import { getCases } from "@/lib/cases";

const limit = 3;

export const BeforeAfterGallery = async () => {
  const allCases = await getCases();
  const items = allCases
    .filter((item) => item.category === "bordplade" && item.afterImage && item.finish === "olie")
    .slice(0, limit);
  if (items.length === 0) {
    return null;
  }
  return (
    <section className="py-10 md:py-16">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Før og efter (træsort &amp; olie)</h2>
        <p className="text-sm text-muted-foreground">
          Små udvalgte eksempler på hvordan forskellige træsorter tager sig ud før og efter
          slibning med olie. Vi viser kun få ad gangen for at holde kvaliteten tydelig.
        </p>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border/70 bg-white/70 p-4">
            <div className="grid grid-cols-2 gap-2">
              <figure className="space-y-2">
                <BpsImage
                  src={item.beforeImage}
                  alt={item.beforeAlt}
                  width={1200}
                  height={900}
                  className="h-32 w-full rounded-xl object-cover"
                  />
                  <figcaption className="text-xs text-muted-foreground">Før</figcaption>
              </figure>
              <figure className="space-y-2">
                <BpsImage
                  src={item.afterImage || item.beforeImage}
                  alt={item.afterAlt || item.beforeAlt}
                  width={1200}
                  height={900}
                  className="h-32 w-full rounded-xl object-cover"
                  />
                  <figcaption className="text-xs text-muted-foreground">Efter</figcaption>
              </figure>
            </div>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{item.title}</p>
              <p>Olie-farve: {item.problem}</p>
              <p>Lokation: {item.location}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/bordpladeslibning/prisberegner">Få et prisestimat</Link>
        </Button>
      </div>
    </section>
  );
};
