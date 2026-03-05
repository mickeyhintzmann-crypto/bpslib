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
  showFeatureShowcase?: boolean;
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
  heroBackgroundImage = defaultBordpladeHeroImage,
  showFeatureShowcase
}: PageHeroProps) => {
  const shouldShowFeatureShowcase =
    showFeatureShowcase ?? eyebrow?.trim().toLowerCase() === "by-side";

  const content = (
    <div className="space-y-5">
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
  );

  if (withImageHero) {
    return (
      <CityImageHero
        backgroundImage={heroBackgroundImage}
        featureCategory="bordplade"
        showFeatureShowcase={shouldShowFeatureShowcase}
      >
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
