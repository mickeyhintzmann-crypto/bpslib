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
        className="absolute inset-0 bg-[linear-gradient(100deg,hsl(228_30%_8%/0.82)_0%,hsl(228_30%_8%/0.62)_45%,hsl(228_30%_8%/0.46)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_140%_at_10%_18%,hsl(228_38%_5%/0.45)_0%,transparent_56%)]"
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-4 py-10 md:px-6 md:py-14">
        <div className="max-w-3xl rounded-3xl border border-white/85 bg-white/97 p-6 text-foreground shadow-[0_30px_54px_hsl(228_30%_8%/0.34)] backdrop-blur-[1px] md:p-9">
          {children}
        </div>
      </div>
    </section>
  );
};
