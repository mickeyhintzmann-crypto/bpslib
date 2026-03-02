"use client";

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/Section";
import { clientLogos } from "@/lib/clientLogos";

type ClientLogoWallProps = {
  variant?: "prominent" | "compact";
};

const LogoCard = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <li
      className="group flex h-[92px] items-center justify-center rounded-2xl border border-border/70 bg-white px-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <Image
        src={src}
        alt={alt}
        width={320}
        height={150}
        sizes="(max-width: 767px) 42vw, 22vw"
        className="h-auto w-auto max-h-[44px] object-contain transition duration-200 group-hover:scale-[1.02] md:max-h-[50px]"
      />
    </li>
  );
};

const LogoRailItem = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <li className="logo-marquee-item flex min-w-[180px] items-center justify-center px-6 py-3 md:min-w-[220px] md:px-8 md:py-4">
      <Image
        src={src}
        alt={alt}
        width={280}
        height={120}
        sizes="(max-width: 768px) 42vw, (max-width: 1200px) 24vw, 14vw"
        className="h-auto w-auto max-h-[42px] object-contain opacity-75 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0 md:max-h-[52px]"
      />
    </li>
  );
};

export const ClientLogoWall = ({ variant = "prominent" }: ClientLogoWallProps) => {
  if (!clientLogos.length) {
    return null;
  }

  const compact = variant === "compact";
  const featuredNames = clientLogos.map((item) => item.alt.replace(/\s+logo$/i, "")).slice(0, 6);
  const marqueeLogos = [...clientLogos, ...clientLogos];

  if (!compact) {
    return (
      <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 border-y border-border/70 bg-[hsl(220_22%_95%)] py-10 md:py-12">
        <div className="mx-auto w-full max-w-[1320px] px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-center lg:gap-10">
            <div className="space-y-2 text-center lg:text-left">
              <p className="text-sm font-medium text-muted-foreground">Et udvalg af</p>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Vores referencer
              </h2>
              <p className="text-sm text-muted-foreground md:text-base">
                Dokumenteret arbejde for professionelle kunder.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/70 py-3 shadow-[0_18px_40px_hsl(220_18%_18%/0.08)] md:py-4">
              <div className="logo-marquee-mask pointer-events-none absolute inset-y-0 left-0 w-16 md:w-20" />
              <div className="logo-marquee-mask logo-marquee-mask-right pointer-events-none absolute inset-y-0 right-0 w-16 md:w-20" />

              <div className="logo-marquee-track">
                <ul className="flex w-max items-center">
                  {marqueeLogos.map((logo, index) => (
                    <LogoRailItem key={`${logo.src}-${index}`} src={logo.src} alt={logo.alt} />
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {featuredNames.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border/65 bg-white px-3 py-1 text-xs font-semibold text-foreground"
              >
                {name}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button asChild size="lg" className="h-12 px-6">
              <Link href="/referencer">Se alle referencer</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-12 px-6">
              <Link href="/cases">Se cases</Link>
            </Button>
          </div>
        </div>

        <style jsx>{`
          .logo-marquee-track {
            display: flex;
            width: max-content;
            animation: logoMarquee 42s linear infinite;
            will-change: transform;
          }

          .logo-marquee-mask {
            background: linear-gradient(to right, hsl(0 0% 100% / 0.85), transparent);
            z-index: 2;
          }

          .logo-marquee-mask-right {
            transform: scaleX(-1);
          }

          .logo-marquee-item {
            position: relative;
          }

          .logo-marquee-item::after {
            content: "";
            position: absolute;
            right: 0;
            top: 50%;
            height: 34px;
            width: 1px;
            transform: translateY(-50%);
            background: hsl(220 14% 84%);
            opacity: 0.7;
          }

          @keyframes logoMarquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .logo-marquee-track {
              animation: none;
            }
          }
        `}</style>
      </section>
    );
  }

  return (
    <Section className="py-6 md:py-8" eyebrow="Udvalgte referencer">
      <div className="surface-panel rounded-[30px] p-5 md:p-7">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              Dokumenteret arbejde for professionelle kunder
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Et udvalg af virksomheder og institutioner vi har udført opgaver for.
            </p>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full border border-border/70 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {clientLogos.length} enterprise referencer
            </span>
          </div>
        </div>

        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {clientLogos.map((logo) => (
            <LogoCard key={logo.src} src={logo.src} alt={logo.alt} />
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="sm" className="h-10 px-5">
            <Link href="/referencer">Se alle referencer</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="h-10 px-5"
          >
            <Link href="/cases">Se cases</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
};
