"use client";

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/Section";
import { clientLogos } from "@/lib/clientLogos";

type ClientLogoWallProps = {
  variant?: "prominent" | "compact";
};

const LogoCard = ({ src, alt, compact }: { src: string; alt: string; compact: boolean }) => {
  return (
    <li
      className={`group flex items-center justify-center rounded-2xl border border-border/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        compact ? "h-[92px] px-4" : "h-[112px] px-5 md:h-[126px]"
      }`}
    >
      <Image
        src={src}
        alt={alt}
        width={320}
        height={150}
        sizes={compact ? "(max-width: 767px) 42vw, 22vw" : "(max-width: 767px) 42vw, 16vw"}
        className={`h-auto w-auto object-contain transition duration-200 group-hover:scale-[1.02] ${
          compact ? "max-h-[44px] md:max-h-[50px]" : "max-h-[52px] md:max-h-[60px]"
        }`}
      />
    </li>
  );
};

export const ClientLogoWall = ({ variant = "prominent" }: ClientLogoWallProps) => {
  if (!clientLogos.length) {
    return null;
  }

  const compact = variant === "compact";

  return (
    <Section
      className={compact ? "py-6 md:py-8" : "py-10 md:py-12"}
      eyebrow={compact ? "Udvalgte referencer" : "Store kunder vi arbejder for"}
    >
      <div className={`surface-panel rounded-[30px] ${compact ? "p-5 md:p-7" : "p-6 md:p-10"}`}>
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className={compact ? "text-2xl font-semibold text-foreground md:text-3xl" : "text-3xl font-semibold text-foreground md:text-4xl"}>
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

        <ul className={`mt-7 grid ${compact ? "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" : "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4"}`}>
          {clientLogos.map((logo) => (
            <LogoCard key={logo.src} src={logo.src} alt={logo.alt} compact={compact} />
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size={compact ? "sm" : "lg"} className={compact ? "h-10 px-5" : "h-12 px-6"}>
            <Link href="/referencer">Se alle referencer</Link>
          </Button>
          <Button
            asChild
            size={compact ? "sm" : "lg"}
            variant="secondary"
            className={compact ? "h-10 px-5" : "h-12 px-6"}
          >
            <Link href="/cases">Se cases</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
};
