import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/Section";
import { clientLogos } from "@/lib/clientLogos";

const LogoItem = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <li className="group flex min-h-[72px] items-center justify-center rounded-xl border border-border/40 bg-background/40 px-3 py-2 transition">
      <Image
        src={src}
        alt={alt}
        width={220}
        height={110}
        sizes="(max-width: 767px) 45vw, (max-width: 1023px) 18vw, 12vw"
        className="h-auto max-h-10 w-auto object-contain opacity-70 grayscale transition duration-200 group-hover:opacity-100 group-hover:grayscale-0"
      />
    </li>
  );
};

export const ClientLogoWall = () => {
  if (!clientLogos.length) {
    return null;
  }

  return (
    <Section className="py-6 md:py-8" eyebrow="Udvalgte referencer">
      <div>
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
          Dokumenteret arbejde for professionelle kunder
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Et udvalg af virksomheder og institutioner vi har udført opgaver for.
        </p>

        <div className="mt-6 md:hidden">
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {clientLogos.map((logo) => (
              <li key={logo.src} className="min-w-[140px] snap-start">
                <LogoItem src={logo.src} alt={logo.alt} />
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-6 hidden grid-cols-6 gap-3 lg:grid-cols-8 md:grid">
          {clientLogos.map((logo) => (
            <LogoItem key={logo.src} src={logo.src} alt={logo.alt} />
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="sm" className="h-10 px-5">
            <Link href="/referencer">Se alle referencer</Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="h-10 px-5">
            <Link href="/cases">Se cases</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
};
