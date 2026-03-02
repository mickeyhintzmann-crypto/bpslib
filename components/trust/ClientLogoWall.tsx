import Image from "next/image";

import { clientLogos } from "@/lib/clientLogos";
import { Section } from "@/components/ui/Section";

export const ClientLogoWall = () => {
  if (!clientLogos.length) {
    return null;
  }

  return (
    <Section className="py-6 md:py-8">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-5 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
          Dokumenteret arbejde for professionelle kunder
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Et udvalg af virksomheder og institutioner vi har udført opgaver for.
        </p>

        <ul className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-5 lg:grid-cols-8">
          {clientLogos.map((logo) => (
            <li
              key={logo.src}
              className="flex min-h-[74px] items-center justify-center rounded-2xl border border-border/70 bg-background/70 p-3 opacity-70 transition hover:opacity-100"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={220}
                height={110}
                sizes="(max-width: 767px) 30vw, (max-width: 1023px) 18vw, 10vw"
                className="h-auto max-h-10 w-auto object-contain"
              />
            </li>
          ))}
        </ul>
      </section>
    </Section>
  );
};
