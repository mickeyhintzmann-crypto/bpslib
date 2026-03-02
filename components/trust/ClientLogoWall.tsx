"use client";

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/Section";
import { clientLogos } from "@/lib/clientLogos";

const LogoItem = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <li className="group flex h-16 w-[170px] shrink-0 items-center justify-center px-3 sm:w-[190px] md:h-[78px] md:w-[220px]">
      <Image
        src={src}
        alt={alt}
        width={220}
        height={110}
        sizes="(max-width: 767px) 170px, (max-width: 1023px) 190px, 220px"
        className="h-auto max-h-[36px] w-auto object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 md:max-h-[46px]"
      />
    </li>
  );
};

export const ClientLogoWall = () => {
  if (!clientLogos.length) {
    return null;
  }

  const marqueeLogos = [...clientLogos, ...clientLogos];

  return (
    <Section className="py-7 md:py-10" eyebrow="Udvalgte referencer">
      <div className="rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,hsl(0_0%_100%/0.86),hsl(36_48%_96%/0.66))] p-5 md:p-7">
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
          Dokumenteret arbejde for professionelle kunder
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Et udvalg af virksomheder og institutioner vi har udført opgaver for.
        </p>

        <div className="marquee mt-7 overflow-hidden motion-reduce:hidden">
          <ul className="marquee-track flex min-w-max items-center gap-3 md:gap-5">
            {marqueeLogos.map((logo, index) => (
              <li key={`${logo.src}-${index}`}>
                <LogoItem src={logo.src} alt={logo.alt} />
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-7 hidden grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 md:gap-3 lg:grid-cols-8 motion-reduce:grid">
          {clientLogos.map((logo) => (
            <LogoItem key={logo.src} src={logo.src} alt={logo.alt} />
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="sm" className="h-10 px-5">
            <Link href="/referencer">Se alle referencer</Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="h-10 px-5">
            <Link href="/cases">Se cases</Link>
          </Button>
        </div>
      </div>
      <style jsx>{`
        .marquee-track {
          animation: client-logo-marquee 30s linear infinite;
          will-change: transform;
        }

        @keyframes client-logo-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (hover: hover) {
          .marquee:hover .marquee-track {
            animation-play-state: paused;
          }
        }
      `}</style>
    </Section>
  );
};
