import routesData from "@/lib/site-registry.json";

export type NavGroup = "bordplade" | "gulv" | "fag" | "core" | "legal";

export type SiteRoute = {
  path: string;
  title: string;
  description: string;
  navGroup: NavGroup;
  showInHeader: boolean;
  showInFooter: boolean;
  priority: number;
  noIndex: boolean;
  showInLinkRouter?: boolean;
};

export type RegistryLink = {
  href: string;
  label: string;
  description: string;
};

export const routes: SiteRoute[] = routesData as SiteRoute[];

const sortByPriority = (a: SiteRoute, b: SiteRoute) => a.priority - b.priority;

const toLink = (route: SiteRoute): RegistryLink => ({
  href: route.path,
  label: route.title,
  description: route.description
});

export const getRouteByPath = (path: string) => routes.find((route) => route.path === path) ?? null;

export const getRoutesByGroup = (navGroup: NavGroup) =>
  routes.filter((route) => route.navGroup === navGroup).sort(sortByPriority);

export const getHeaderRoutesByGroup = (navGroup: Exclude<NavGroup, "legal">) =>
  routes
    .filter((route) => route.navGroup === navGroup && route.showInHeader)
    .sort(sortByPriority)
    .map(toLink);

export const getFooterRoutesByGroup = (navGroup: NavGroup) =>
  routes
    .filter((route) => route.navGroup === navGroup && route.showInFooter)
    .sort(sortByPriority)
    .map(toLink);

export const headerRegistry = {
  bordplade: getHeaderRoutesByGroup("bordplade"),
  gulv: getHeaderRoutesByGroup("gulv"),
  fag: getHeaderRoutesByGroup("fag"),
  core: getHeaderRoutesByGroup("core"),
  cta: toLink(getRouteByPath("/bordpladeslibning/prisberegner") || getRoutesByGroup("bordplade")[0])
};

export const footerRegistry = {
  bordplade: getFooterRoutesByGroup("bordplade"),
  gulvOgFag: [
    ...getFooterRoutesByGroup("gulv"),
    ...routes
      .filter(
        (route) =>
          route.navGroup === "core" && route.showInFooter && route.path === "/tilbudstid"
      )
      .sort(sortByPriority)
      .map(toLink)
  ],
  core: getFooterRoutesByGroup("core").filter((route) => route.href !== "/tilbudstid"),
  legal: getFooterRoutesByGroup("legal")
};

export const featuredRoutes = routes
  .filter((route) => route.showInLinkRouter)
  .sort(sortByPriority)
  .map(toLink)
  .slice(0, 12);

export const sitemapRoutes = routes.filter((route) => !route.noIndex).sort(sortByPriority);
