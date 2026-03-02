const FALLBACK_IMAGE_PATHS = new Set(["/images/placeholders/fallback.svg"]);

const normalizePath = (src: string) => src.split("?")[0].split("#")[0];

export const isLocalImageAvailable = (src?: string | null) => {
  if (!src) {
    return false;
  }

  const cleanSrc = normalizePath(src);
  if (FALLBACK_IMAGE_PATHS.has(cleanSrc)) {
    return false;
  }

  // Avoid fs/probing in runtime to keep serverless bundles small.
  if (cleanSrc.startsWith("/images/")) {
    return true;
  }

  return true;
};
