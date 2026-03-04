import { FooterCityCoverage } from "@/components/footer/FooterCityCoverage";
import { footerRegistry } from "@/lib/site-registry";

const bordpladeRegionPaths = new Set([
  "/bordpladeslibning-sjaelland",
  "/bordpladeslibning-koebenhavn-omegn",
  "/bordpladeslibning-amager",
  "/bordpladeslibning-nordsjaelland",
  "/bordpladeslibning-midtsjaelland",
  "/bordpladeslibning-vest-sydsjaelland"
]);

const gulvRegionPaths = new Set([
  "/gulvafslibning-sjaelland",
  "/gulvafslibning-koebenhavn-omegn",
  "/gulvafslibning-amager",
  "/gulvafslibning-nordsjaelland",
  "/gulvafslibning-midtsjaelland",
  "/gulvafslibning-vest-sydsjaelland"
]);

const isBordpladeCity = (href: string) =>
  href.startsWith("/bordpladeslibning-") && !bordpladeRegionPaths.has(href) && href !== "/bordpladeslibning/omraader";

const isGulvCity = (href: string) =>
  href.startsWith("/gulvafslibning-") && !gulvRegionPaths.has(href) && href !== "/gulvafslibning/omraader";

export const FooterCityCoverageSection = () => {
  const bordpladeCityLinks = footerRegistry.bordplade.filter((route) => isBordpladeCity(route.href));
  const gulvCityLinks = footerRegistry.gulvOgFag.filter((route) => isGulvCity(route.href));

  return (
    <section className="border-t border-border/70 bg-background">
      <div className="mx-auto w-full max-w-[1180px] px-6 py-10">
        <FooterCityCoverage bordpladeCities={bordpladeCityLinks} gulvCities={gulvCityLinks} />
      </div>
    </section>
  );
};
