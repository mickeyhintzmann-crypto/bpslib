import { CtaRow } from "@/components/bordplade/CtaRow";
import { CityImageHero } from "@/components/layouts/CityImageHero";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  intro: string;
  showAkutteTider?: boolean;
  trustItems?: string[];
  withImageHero?: boolean;
  heroBackgroundImage?: string;
};

const defaultTrust = ["15+ års erfaring", "Kun massiv træ", "Svar hurtigt"];
const defaultBordpladeHeroImage = "/media/featured%3Abordplade/20210320_105853.jpg";

export const PageHero = ({
  eyebrow,
  title,
  intro,
  showAkutteTider = true,
  trustItems = defaultTrust,
  withImageHero = false,
  heroBackgroundImage = defaultBordpladeHeroImage
}: PageHeroProps) => {
  const isImageHero = withImageHero;
  const content = (
    <div className="space-y-5">
      {eyebrow ? (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${
            isImageHero ? "text-foreground/75" : "text-muted-foreground"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
        {title}
      </h1>
      <p className={`max-w-3xl text-base md:text-lg ${isImageHero ? "text-foreground/90" : "text-muted-foreground"}`}>
        {intro}
      </p>
      <CtaRow showAkutteTider={showAkutteTider} />
      <div className={`flex flex-wrap gap-3 text-xs ${isImageHero ? "text-foreground/80" : "text-muted-foreground"}`}>
        {trustItems.map((item) => (
          <span
            key={item}
            className={`rounded-full px-3 py-1 ${isImageHero ? "border border-white/55 bg-white/36" : "border border-border/70"}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );

  if (withImageHero) {
    return (
      <CityImageHero backgroundImage={heroBackgroundImage} panelTransparent>
        {content}
      </CityImageHero>
    );
  }

  return (
    <section className="py-10 md:py-14">
      <div className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">{content}</div>
    </section>
  );
};
