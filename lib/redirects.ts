import redirectsMap from "@/redirects/redirects.json";

export type RedirectsMap = Record<string, string>;

const redirects = redirectsMap as RedirectsMap;
const redirectsLower = Object.fromEntries(
  Object.entries(redirects).map(([source, destination]) => [source.toLowerCase(), destination])
) as RedirectsMap;

export const getRedirectTarget = (path: string) => {
  return redirects[path] ?? redirectsLower[path.toLowerCase()] ?? null;
};

export const hasRedirect = (path: string) => {
  return Boolean(getRedirectTarget(path));
};
