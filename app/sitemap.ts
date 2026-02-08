import type { MetadataRoute } from "next";

import { sitemapRoutes } from "@/lib/site-registry";

const baseUrl = "https://bpslib.dk";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return sitemapRoutes.map((route) => ({
    url: `${baseUrl}${route.path === "/" ? "" : route.path}`,
    lastModified
  }));
}
