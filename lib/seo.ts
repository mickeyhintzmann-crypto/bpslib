import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";

const normalizePath = (path: string) => {
  if (!path || path === "/") {
    return "";
  }
  let normalized = path.trim();
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  normalized = normalized.toLowerCase();
  if (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

type MetadataInput = {
  title: string;
  description: string;
  path: string;
};

export const buildMetadata = ({ title, description, path }: MetadataInput): Metadata => {
  const siteUrl = getSiteUrl();
  const noIndex = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";
  const normalizedPath = normalizePath(path);
  const canonical = `${siteUrl}${normalizedPath}`;
  const fullTitle = `${title} | ${siteConfig.companyName}`;

  return {
    title: fullTitle,
    description,
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true
        }
      : undefined,
    alternates: {
      canonical
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: siteConfig.companyName,
      locale: "da_DK",
      type: "website"
    }
  };
};
