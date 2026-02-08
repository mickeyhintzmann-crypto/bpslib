import { CtaRow } from "@/components/bordplade/CtaRow";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  intro: string;
  showAkutteTider?: boolean;
  trustItems?: string[];
};

const defaultTrust = ["15+ års erfaring", "Kun massiv træ", "Svar hurtigt"];

export const PageHero = ({
  eyebrow,
  title,
  intro,
  showAkutteTider = true,
  trustItems = defaultTrust
}: PageHeroProps) => {
  return (
    <section className="py-10 md:py-14">
      <div className="space-y-5 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground md:text-lg">{intro}</p>
        <CtaRow showAkutteTider={showAkutteTider} />
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {trustItems.map((item) => (
            <span key={item} className="rounded-full border border-border/70 px-3 py-1">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
