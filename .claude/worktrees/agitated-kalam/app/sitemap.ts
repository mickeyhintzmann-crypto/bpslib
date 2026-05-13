import type { MetadataRoute } from "next";

import { sitemapRoutes } from "@/lib/site-registry";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const baseUrl = getSiteUrl();
  return sitemapRoutes.map((route) => ({
    url: `${baseUrl}${route.path === "/" ? "" : route.path}`,
    lastModified
  }));
}
