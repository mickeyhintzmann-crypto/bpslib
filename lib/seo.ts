import type { Metadata } from "next";

import { brandAssets } from "@/lib/assets";
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
  keywords?: string[];
  ogImagePath?: string;
};

const resolveImageUrl = (siteUrl: string, ogImagePath?: string) => {
  const fallbackImage = `${siteUrl}${brandAssets.hero}`;
  const normalizedPath = ogImagePath?.trim();

  if (!normalizedPath) {
    return fallbackImage;
  }

  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    return normalizedPath;
  }

  return `${siteUrl}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
};

export const buildMetadata = ({ title, description, path, keywords, ogImagePath }: MetadataInput): Metadata => {
  const siteUrl = getSiteUrl();
  const noIndex = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";
  const normalizedPath = normalizePath(path);
  const canonical = `${siteUrl}${normalizedPath}`;
  const fullTitle = `${title} | ${siteConfig.companyName}`;
  const imageUrl = resolveImageUrl(siteUrl, ogImagePath);

  return {
    title: fullTitle,
    description,
    keywords,
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
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl]
    }
  };
};
