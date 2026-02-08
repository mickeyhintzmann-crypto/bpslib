import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { bordpladeCasePlaceholders } from "@/lib/bordplade/cases";

const placeholderSvg = (label: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='720' height='480'>
    <rect width='100%' height='100%' fill='#f2e7d8'/>
    <rect x='32' y='32' width='656' height='416' rx='24' fill='#ffffff' stroke='#d9c9b5' stroke-width='2'/>
    <text x='50%' y='50%' text-anchor='middle' font-family='Arial' font-size='24' fill='#8c6b4d'>${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const BeforeAfterGallery = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Før og efter</h2>
        <p className="text-sm text-muted-foreground">
          Eksempler på typiske problemer og den finish vi leverer på massiv træbordplader.
        </p>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {bordpladeCasePlaceholders.map((item) => (
          <div key={item.title} className="rounded-2xl border border-border/70 bg-white/70 p-4">
            <Image
              src={placeholderSvg(item.title)}
              alt={item.title}
              width={720}
              height={480}
              className="h-40 w-full rounded-xl object-cover"
              unoptimized
            />
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Problem: {item.title}</p>
              <p>Løsning: {item.solution}</p>
              <p>Finish: {item.finish}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/bordpladeslibning/book">Book tid</Link>
        </Button>
      </div>
    </section>
  );
};
