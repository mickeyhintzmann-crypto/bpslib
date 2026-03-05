import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { galleryBordplade, galleryGulv } from "@/lib/mediaManifest";

type CityFeatureCategory = "bordplade" | "gulv";

type FeatureCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  altPrefix: string;
};

const FEATURE_COPY: Record<CityFeatureCategory, FeatureCopy> = {
  bordplade: {
    eyebrow: "Udvalgte feature-billeder",
    title: "Bordpladeopgaver i samme stil som hovedsiden",
    subtitle:
      "Et visuelt udsnit af opgaver med fokus på massiv træ, ensartet finish og tydeligt resultat.",
    bullets: [
      "Udvalgt fra aktuelle feature-billeder i biblioteket",
      "Visuel dokumentation af typiske opgavetyper",
      "Samme varme panelstil som på hovedsiderne"
    ],
    primaryCta: { label: "Se bordplade-cases", href: "/bordpladeslibning/cases" },
    secondaryCta: { label: "Få pris via billeder", href: "/bordpladeslibning/prisberegner" },
    altPrefix: "Bordpladeopgave"
  },
  gulv: {
    eyebrow: "Udvalgte feature-billeder",
    title: "Gulvopgaver med mere visuel hovedside-stil",
    subtitle:
      "Et hurtigt billed-overblik fra gulvopgaver, så bysiderne får samme billedtyngde som hovedsiderne.",
    bullets: [
      "Udvalgt fra aktuelle feature-billeder i biblioteket",
      "Viser typiske gulvforløb og finish-udtryk",
      "Matcher sideflader og kort-layout på tværs af bysider"
    ],
    primaryCta: { label: "Se gulv-cases", href: "/gulvafslibning/cases" },
    secondaryCta: { label: "Book tilbudstid", href: "/tilbudstid" },
    altPrefix: "Gulvopgave"
  }
};

const FEATURE_INDEXES = [0, 3, 6] as const;

const normaliseMediaPath = (path: string) =>
  path
    .split("/")
    .map((segment, index) => {
      if (index === 0 || segment.length === 0) {
        return segment;
      }

      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");

const pickFeatureImages = (category: CityFeatureCategory): string[] => {
  const pool = category === "bordplade" ? galleryBordplade : galleryGulv;
  const fallback =
    category === "bordplade"
      ? "/media/featured%3Abordplade/20210320_105853.jpg"
      : "/media/featured%3Agulv/20230219_193820.jpg";

  if (pool.length === 0) {
    return [fallback, fallback, fallback];
  }

  return FEATURE_INDEXES.map((index) => normaliseMediaPath(pool[index % pool.length]));
};

const pickFeatureImagesByIndexes = (
  category: CityFeatureCategory,
  indexes: readonly number[]
): string[] => {
  const pool = category === "bordplade" ? galleryBordplade : galleryGulv;
  const fallback =
    category === "bordplade"
      ? "/media/featured%3Abordplade/20210320_105853.jpg"
      : "/media/featured%3Agulv/20230219_193820.jpg";

  if (pool.length === 0) {
    return indexes.map(() => fallback);
  }

  return indexes.map((index) => normaliseMediaPath(pool[index % pool.length]));
};

type CityFeatureShowcaseProps = {
  category: CityFeatureCategory;
};

export const CityFeatureShowcase = ({ category }: CityFeatureShowcaseProps) => {
  const copy = FEATURE_COPY[category];
  const [mainImage, supportingImageA, supportingImageB] = pickFeatureImages(category);

  return (
    <section className="city-feature-showcase surface-panel overflow-hidden rounded-[30px] p-4 md:p-7">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {copy.eyebrow}
          </p>
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{copy.title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{copy.subtitle}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {copy.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/80" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild>
              <Link href={copy.primaryCta.href}>{copy.primaryCta.label}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={copy.secondaryCta.href}>{copy.secondaryCta.label}</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <figure className="relative min-h-[236px] overflow-hidden rounded-2xl border border-border/70 sm:row-span-2 sm:min-h-[100%]">
            <Image
              src={mainImage}
              alt={`${copy.altPrefix} - hovedbillede`}
              fill
              sizes="(min-width: 1024px) 32vw, (min-width: 640px) 44vw, 100vw"
              className="object-cover transition duration-500 hover:scale-[1.03]"
            />
          </figure>

          <figure className="relative min-h-[114px] overflow-hidden rounded-2xl border border-border/70 sm:min-h-[152px]">
            <Image
              src={supportingImageA}
              alt={`${copy.altPrefix} - featurebillede 2`}
              fill
              sizes="(min-width: 1024px) 15vw, (min-width: 640px) 22vw, 50vw"
              className="object-cover transition duration-500 hover:scale-[1.03]"
            />
          </figure>

          <figure className="relative min-h-[114px] overflow-hidden rounded-2xl border border-border/70 sm:min-h-[152px]">
            <Image
              src={supportingImageB}
              alt={`${copy.altPrefix} - featurebillede 3`}
              fill
              sizes="(min-width: 1024px) 15vw, (min-width: 640px) 22vw, 50vw"
              className="object-cover transition duration-500 hover:scale-[1.03]"
            />
          </figure>
        </div>
      </div>
    </section>
  );
};

const FEATURE_BAND_COPY: Record<
  CityFeatureCategory,
  {
    title: string;
    subtitle: string;
    points: string[];
    cta: { label: string; href: string };
  }
> = {
  bordplade: {
    title: "Samme visuelle stil hele vejen ned",
    subtitle:
      "Bysiden er bygget med samme varme flader, kontraster og billedtyngde som hovedsiden.",
    points: [
      "Feature-billeder bruges aktivt i indholdsflowet",
      "Sektioner er opdelt i tydelige, lette trin",
      "Knapper og kort følger samme farveprofil"
    ],
    cta: { label: "Start med billeder", href: "/bordpladeslibning/prisberegner" }
  },
  gulv: {
    title: "Visuelt flow med feature-billeder",
    subtitle:
      "Indhold, kort og billedsektioner er nu bygget i samme retning som hovedsiderne, ikke kun i hero.",
    points: [
      "Billeder understøtter forklaringerne i sektionerne",
      "Ensartet panelstil og kontrast på hele siden",
      "Klar struktur med tydelige næste skridt"
    ],
    cta: { label: "Book tilbudstid", href: "/tilbudstid" }
  }
};

export const CityFeatureBand = ({ category }: CityFeatureShowcaseProps) => {
  const copy = FEATURE_BAND_COPY[category];
  const [primaryImage, secondaryImage] = pickFeatureImagesByIndexes(category, [4, 8]);

  return (
    <section className="city-feature-band city-surface city-surface--panel rounded-[30px] p-5 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{copy.title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{copy.subtitle}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {copy.points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/80" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <Button asChild>
            <Link href={copy.cta.href}>{copy.cta.label}</Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <figure className="relative min-h-[198px] overflow-hidden rounded-2xl border border-border/70">
            <Image
              src={primaryImage}
              alt="Featurebillede fra opgave"
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 42vw, 100vw"
              className="object-cover transition duration-500 hover:scale-[1.03]"
            />
          </figure>
          <figure className="relative min-h-[198px] overflow-hidden rounded-2xl border border-border/70">
            <Image
              src={secondaryImage}
              alt="Featurebillede fra opgave"
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 42vw, 100vw"
              className="object-cover transition duration-500 hover:scale-[1.03]"
            />
          </figure>
        </div>
      </div>
    </section>
  );
};

const FEATURE_GALLERY_COPY: Record<
  CityFeatureCategory,
  { title: string; subtitle: string; cta: { label: string; href: string } }
> = {
  bordplade: {
    title: "Flere feature-billeder fra bordpladeopgaver",
    subtitle: "Et ekstra visuelt lag, så siden føles levende fra top til bund.",
    cta: { label: "Se alle bordplade-cases", href: "/bordpladeslibning/cases" }
  },
  gulv: {
    title: "Flere feature-billeder fra gulvopgaver",
    subtitle: "Billederne bruges aktivt som del af indholdsflowet på tværs af bysider.",
    cta: { label: "Se alle gulv-cases", href: "/gulvafslibning/cases" }
  }
};

export const CityFeatureGallery = ({ category }: CityFeatureShowcaseProps) => {
  const copy = FEATURE_GALLERY_COPY[category];
  const images = pickFeatureImagesByIndexes(category, [1, 5, 9]);

  return (
    <section className="city-feature-gallery city-surface city-surface--panel rounded-[30px] p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{copy.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{copy.subtitle}</p>
        </div>
        <Button asChild variant="secondary">
          <Link href={copy.cta.href}>{copy.cta.label}</Link>
        </Button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {images.map((image, index) => (
          <figure
            key={`${image}-${index}`}
            className="relative min-h-[190px] overflow-hidden rounded-2xl border border-border/70 md:min-h-[210px]"
          >
            <Image
              src={image}
              alt="Featurebillede fra opgave"
              fill
              sizes="(min-width: 768px) 28vw, 100vw"
              className="object-cover transition duration-500 hover:scale-[1.03]"
            />
          </figure>
        ))}
      </div>
    </section>
  );
};

export type { CityFeatureCategory };
