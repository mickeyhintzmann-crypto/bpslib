import { type ReactNode } from "react";

type CityImageHeroProps = {
  backgroundImage: string;
  children: ReactNode;
};

export const CityImageHero = ({
  backgroundImage,
  children
}: CityImageHeroProps) => {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden border-b border-border/50">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(105deg,hsl(228_30%_8%/0.86)_0%,hsl(228_30%_8%/0.66)_48%,hsl(228_30%_8%/0.5)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_140%_at_10%_18%,hsl(228_38%_5%/0.48)_0%,transparent_56%)]"
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-4 py-11 md:px-6 md:py-16">
        <div className="max-w-4xl rounded-[34px] bg-[linear-gradient(120deg,hsl(var(--primary)/0.62)_0%,hsl(34_98%_66%/0.42)_36%,hsl(203_88%_62%/0.32)_100%)] p-[1px] shadow-[0_36px_70px_hsl(228_30%_8%/0.42)]">
          <div className="overflow-hidden rounded-[33px] border border-white/30 bg-[linear-gradient(165deg,hsl(0_0%_100%/0.98)_0%,hsl(37_60%_96%/0.95)_72%,hsl(35_58%_94%/0.92)_100%)]">
            <div
              aria-hidden="true"
              className="h-1.5 w-full bg-transparent"
            />
            <div className="p-6 text-foreground md:p-9">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
