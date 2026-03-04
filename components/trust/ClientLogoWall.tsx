"use client";

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/Section";
import { clientLogos } from "@/lib/clientLogos";

type ClientLogoWallProps = {
  variant?: "prominent" | "compact";
};

const LogoRailItem = ({ src, alt, compact = false }: { src: string; alt: string; compact?: boolean }) => {
  const isRigshospitalLogo = /rigshospital/i.test(alt);
  const isSkatteministerietLogo = /skatteministeriet/i.test(alt);
  const itemClass = compact
    ? "logo-marquee-item flex min-w-[180px] items-center justify-center px-5 py-1 md:min-w-[240px] md:px-7 md:py-1.5"
    : "logo-marquee-item flex min-w-[154px] items-center justify-center px-6 py-1.5 md:min-w-[210px] md:px-7 md:py-2";
  const sizeClass = compact
    ? isRigshospitalLogo
      ? "max-h-[46px] max-w-[176px] md:max-h-[60px] md:max-w-[231px]"
      : isSkatteministerietLogo
        ? "max-h-[133px] max-w-[391px] md:max-h-[168px] md:max-w-[506px]"
      : "max-h-[96px] max-w-[283px] md:max-h-[122px] md:max-w-[367px]"
    : isRigshospitalLogo
      ? "max-h-[38px] max-w-[144px] md:max-h-[49px] md:max-w-[190px]"
      : isSkatteministerietLogo
        ? "max-h-[108px] max-w-[319px] md:max-h-[138px] md:max-w-[417px]"
      : "max-h-[78px] max-w-[231px] md:max-h-[101px] md:max-w-[302px]";

  return (
    <li className={itemClass}>
      <Image
        src={src}
        alt={alt}
        width={420}
        height={180}
        sizes="(max-width: 768px) 56vw, (max-width: 1200px) 30vw, 18vw"
        className={`h-auto w-auto object-contain opacity-100 transition duration-200 ${sizeClass}`}
      />
    </li>
  );
};

export const ClientLogoWall = ({ variant = "prominent" }: ClientLogoWallProps) => {
  if (!clientLogos.length) {
    return null;
  }

  const compact = variant === "compact";
  const marqueeLogos = [...clientLogos, ...clientLogos];

  if (!compact) {
    return (
      <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 border-y border-border/70 bg-white py-4 md:py-5">
        <div className="mx-auto w-full max-w-[1120px] px-4 md:px-6">
          <div className="grid gap-4 lg:grid-cols-[175px_1fr] lg:items-center lg:gap-7">
            <div className="space-y-2 text-center lg:text-left">
              <p className="text-xs text-muted-foreground">Et udvalg af</p>
              <h2 className="font-display text-[2.1rem] font-semibold tracking-tight text-foreground md:text-[2.3rem]">
                Vores referencer
              </h2>
              <p className="text-xs text-muted-foreground md:text-sm">
                Dokumenteret arbejde for professionelle kunder.
              </p>
            </div>

            <div className="relative overflow-hidden py-0.5 md:py-1">
              <div className="logo-marquee-mask pointer-events-none absolute inset-y-0 left-0 w-14 md:w-20" />
              <div className="logo-marquee-mask logo-marquee-mask-right pointer-events-none absolute inset-y-0 right-0 w-14 md:w-20" />

              <div className="logo-marquee-track">
                <ul className="flex w-max items-center">
                  {marqueeLogos.map((logo, index) => (
                    <LogoRailItem key={`${logo.src}-${index}`} src={logo.src} alt={logo.alt} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .logo-marquee-track {
            display: flex;
            width: max-content;
            animation: logoMarquee 54s linear infinite;
            will-change: transform;
          }

          .logo-marquee-mask {
            background: linear-gradient(to right, hsl(0 0% 100% / 1), transparent);
            z-index: 2;
          }

          .logo-marquee-mask-right {
            transform: scaleX(-1);
          }

          .logo-marquee-item {
            position: relative;
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

          @media (max-width: 767px) {
            .logo-marquee-track {
              animation-duration: 42s;
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

        <div className="relative mt-7 overflow-hidden rounded-2xl border border-border/60 bg-white/60 py-0.5">
          <div className="logo-marquee-mask pointer-events-none absolute inset-y-0 left-0 z-[2] w-12" />
          <div className="logo-marquee-mask logo-marquee-mask-right pointer-events-none absolute inset-y-0 right-0 z-[2] w-12" />

          <div className="logo-marquee-track-compact">
            <ul className="flex w-max items-center">
              {[...clientLogos, ...clientLogos].map((logo, index) => (
                <LogoRailItem key={`${logo.src}-compact-${index}`} src={logo.src} alt={logo.alt} compact />
              ))}
            </ul>
          </div>
        </div>

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

      <style jsx>{`
        .logo-marquee-track-compact {
          display: flex;
          width: max-content;
          animation: logoMarqueeCompact 48s linear infinite;
          will-change: transform;
        }

        .logo-marquee-mask {
          background: linear-gradient(to right, hsl(0 0% 100% / 1), transparent);
        }

        .logo-marquee-mask-right {
          transform: scaleX(-1);
        }

        @keyframes logoMarqueeCompact {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-marquee-track-compact {
            animation: none;
          }
        }

        @media (max-width: 767px) {
          .logo-marquee-track-compact {
            animation-duration: 40s;
          }
        }
      `}</style>
    </Section>
  );
};
