import fs from "fs";
import path from "path";

const publicDir = path.join(process.cwd(), "public");
const fallbackPath = path.join(publicDir, "images", "placeholders", "fallback.svg");
let fallbackBuffer: Buffer | null = null;

const normalizePath = (src: string) => src.split("?")[0];

const isFallbackImage = (filePath: string) => {
  if (!fs.existsSync(fallbackPath)) {
    return false;
  }

  const fallbackStat = fs.statSync(fallbackPath);
  const fileStat = fs.statSync(filePath);
  if (fallbackStat.size !== fileStat.size) {
    return false;
  }

  if (!fallbackBuffer) {
    fallbackBuffer = fs.readFileSync(fallbackPath);
  }

  const fileBuffer = fs.readFileSync(filePath);
  return fallbackBuffer.equals(fileBuffer);
};

export const isLocalImageAvailable = (src?: string | null) => {
  if (!src) {
    return false;
  }

  const cleanSrc = normalizePath(src);
  if (!cleanSrc.startsWith("/images/")) {
    return true;
  }

  const filePath = path.join(publicDir, cleanSrc);
  if (!fs.existsSync(filePath)) {
    return false;
  }

  if (isFallbackImage(filePath)) {
    return false;
  }

  return true;
};
