import type { Metadata } from "next";

const SITE_URL = "https://bpslib.dk";

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
  const normalizedPath = normalizePath(path);
  const canonical = `${SITE_URL}${normalizedPath}`;
  const fullTitle = `${title} | BPSLIB`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: "BPSLIB",
      locale: "da_DK",
      type: "website"
    }
  };
};
