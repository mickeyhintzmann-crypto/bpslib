import Link from "next/link";

import { Section } from "@/components/ui/Section";

type LinkItem = {
  href: string;
  label: string;
};

type InternalLinkGridProps = {
  title?: string;
  intro?: string;
  links: LinkItem[];
};

export const InternalLinkGrid = ({
  title = "Relaterede sider",
  intro = "Fortsæt herfra til de sider, der matcher din situation.",
  links
}: InternalLinkGridProps) => {
  return (
    <Section className="py-7 md:py-9">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-white via-white to-primary/5 px-6 py-7 shadow-[0_10px_24px_hsl(20_30%_20%/0.06)] md:px-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative">
          <h2 className="text-[1.65rem] font-semibold leading-tight text-foreground">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{intro}</p>
        </div>

        <div className="relative mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between rounded-xl border border-border/80 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-foreground shadow-[0_6px_14px_hsl(20_30%_20%/0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white hover:shadow-[0_10px_18px_hsl(20_30%_20%/0.09)]"
            >
              <span>{item.label}</span>
              <span className="text-primary transition group-hover:translate-x-0.5" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
};
