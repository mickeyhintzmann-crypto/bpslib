#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, "public");
const manifestOut = path.join(repoRoot, "lib", "mediaManifest.ts");
const logosRoot = path.join(repoRoot, "public", "media", "logos", "clients");

const WEB_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const categoryRoots = {
  gulvafslibning: [
    path.join(repoRoot, "public", "media", "cases", "gulv"),
    path.join(repoRoot, "public", "media", "cases:gulv"),
    path.join(repoRoot, "public", "media", "galleries", "gulv", "before-after"),
    path.join(repoRoot, "public", "media", "galleries:gulv:before-after")
  ],
  bordplade: [
    path.join(repoRoot, "public", "media", "cases", "bordplade"),
    path.join(repoRoot, "public", "media", "cases:bordplade"),
    path.join(repoRoot, "public", "media", "galleries", "bordplade", "before-after"),
    path.join(repoRoot, "public", "media", "galleries:bordplade:before-after")
  ],
  gulvbelaegning: [
    path.join(repoRoot, "public", "media", "cases", "gulvbelaegning"),
    path.join(repoRoot, "public", "media", "cases:gulvbelaegning"),
    path.join(repoRoot, "public", "media", "galleries", "gulvbelaegning", "before-after"),
    path.join(repoRoot, "public", "media", "galleries:gulvbelaegning:before-after")
  ]
};

const featuredRoots = {
  gulvafslibning: [
    path.join(repoRoot, "public", "media", "featured", "gulv"),
    path.join(repoRoot, "public", "media", "featured:gulv")
  ],
  bordplade: [
    path.join(repoRoot, "public", "media", "featured", "bordplade"),
    path.join(repoRoot, "public", "media", "featured:bordplade")
  ],
  gulvbelaegning: [
    path.join(repoRoot, "public", "media", "featured", "gulvbelaegning"),
    path.join(repoRoot, "public", "media", "featured:gulvbelaegning")
  ]
};

function isDirectory(targetPath) {
  try {
    return fs.statSync(targetPath).isDirectory();
  } catch {
    return false;
  }
}

function sorted(list) {
  return [...list].sort((a, b) => a.localeCompare(b, "da", { numeric: true, sensitivity: "base" }));
}

function toWebPath(filePath) {
  const rel = path.relative(publicRoot, filePath);
  return `/${rel.split(path.sep).join("/")}`;
}

function hasExtension(filePath) {
  return WEB_IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function listFilesRecursive(rootDir) {
  const files = [];
  const queue = [rootDir];

  while (queue.length) {
    const current = queue.shift();
    if (!current || !isDirectory(current)) {
      continue;
    }

    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }

      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(absolutePath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (hasExtension(absolutePath)) {
        files.push(absolutePath);
      }
    }
  }

  return sorted(files);
}

function normalizeForMatch(value) {
  return value
    .toLowerCase()
    .replace(/^case[-_ ]*\d+[:._-]*/i, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/\.(svg|png|jpe?g|webp)$/i, "")
    .replace(/\blogo\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function pickBeforeImage(imagePaths) {
  return imagePaths.find((imagePath) => {
    const fileName = path.basename(imagePath).toLowerCase();
    return fileName.includes("before") || fileName.includes("foer");
  });
}

function pickAfterImage(imagePaths) {
  return imagePaths.find((imagePath) => {
    const fileName = path.basename(imagePath).toLowerCase();
    return fileName.includes("after") || fileName.includes("efter") || fileName.includes("finished");
  });
}

function pickFrontImage(imagePaths) {
  return imagePaths.find((imagePath) => {
    const fileName = path.basename(imagePath).toLowerCase();
    return fileName.includes("front") || fileName.includes("forside") || fileName.includes("cover");
  });
}

function titleFromCaseId(caseId) {
  const cleaned = caseId
    .replace(/^case[-_ ]*\d+[:._-]*/i, "")
    .replace(/[-._:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Case";
  }

  const toDanishWord = (word) =>
    word
      .replace(/aa/g, "å")
      .replace(/ae/g, "æ")
      .replace(/oe/g, "ø");

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((part) => toDanishWord(part.toLowerCase()))
    .map((part) => part.charAt(0).toLocaleUpperCase("da-DK") + part.slice(1))
    .join(" ");
}

function loadLogoFiles() {
  if (!isDirectory(logosRoot)) {
    return [];
  }

  return sorted(
    fs
      .readdirSync(logosRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
  );
}

function matchLogo(caseId, logoFiles) {
  const normalizedCaseId = normalizeForMatch(caseId);
  if (!normalizedCaseId) {
    return undefined;
  }

  const logoFile =
    logoFiles.find((fileName) => normalizeForMatch(fileName).includes(normalizedCaseId)) ??
    logoFiles.find((fileName) => normalizedCaseId.includes(normalizeForMatch(fileName)));

  return logoFile ? toWebPath(path.join(logosRoot, logoFile)) : undefined;
}

function buildCategoryCases(category, rootCandidates, logoFiles) {
  const records = [];
  const seenByCaseId = new Set();

  for (const root of rootCandidates) {
    if (!isDirectory(root)) {
      continue;
    }

    const caseDirs = sorted(
      fs
        .readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(root, entry.name))
    );

    for (const caseDir of caseDirs) {
      const caseId = path.basename(caseDir);
      const dedupeKey = `${category}|${caseId}`;
      if (seenByCaseId.has(dedupeKey)) {
        continue;
      }

      const imageFiles = listFilesRecursive(caseDir);
      if (!imageFiles.length) {
        continue;
      }

      seenByCaseId.add(dedupeKey);

      const beforeAbs = pickBeforeImage(imageFiles);
      const afterAbs = pickAfterImage(imageFiles);
      const frontAbs = pickFrontImage(imageFiles);
      const gallery = imageFiles.map((imagePath) => toWebPath(imagePath));

      records.push({
        id: `${category}:${caseId}`,
        caseId,
        category,
        title: titleFromCaseId(caseId),
        location: null,
        frontSrc: frontAbs ? toWebPath(frontAbs) : null,
        beforeSrc: beforeAbs ? toWebPath(beforeAbs) : null,
        afterSrc: afterAbs ? toWebPath(afterAbs) : null,
        gallery,
        clientLogoSrc: matchLogo(caseId, logoFiles)
      });
    }
  }

  return sorted(records.map((item) => JSON.stringify(item))).map((item) => JSON.parse(item));
}

function buildLegacyBeforeAfter(casesList) {
  return casesList
    .filter((item) => item.beforeSrc && item.afterSrc)
    .map((item) => ({
      caseId: item.caseId,
      beforeSrc: item.beforeSrc,
      afterSrc: item.afterSrc
    }));
}

function buildLegacyGallery(casesList) {
  const seen = new Set();
  const gallery = [];

  for (const item of casesList) {
    const candidate = item.frontSrc ?? item.afterSrc ?? item.gallery[0] ?? item.beforeSrc;
    if (!candidate || seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    gallery.push(candidate);
  }

  return gallery;
}

function buildFeaturedGallery(rootCandidates) {
  const seen = new Set();
  const gallery = [];

  for (const root of rootCandidates) {
    if (!isDirectory(root)) {
      continue;
    }

    for (const imagePath of listFilesRecursive(root)) {
      const webPath = toWebPath(imagePath);
      if (seen.has(webPath)) {
        continue;
      }
      seen.add(webPath);
      gallery.push(webPath);
    }
  }

  return gallery;
}

function writeManifest({
  beforeAfterGulv,
  beforeAfterBordplade,
  galleryGulv,
  galleryBordplade,
  galleryGulvbelaegning,
  casesManifest
}) {
  const content = `/* eslint-disable */\n// Auto-generated by scripts/generate-media-manifest.mjs\n// Do not edit manually.\n\nexport type BeforeAfterItem = {\n  caseId: string;\n  beforeSrc: string;\n  afterSrc: string;\n};\n\nexport type CasesManifestCategory = "bordplade" | "gulvafslibning" | "gulvbelaegning";\n\nexport type CasesManifestItem = {\n  id: string;\n  caseId: string;\n  category: CasesManifestCategory;\n  frontSrc: string | null;\n  beforeSrc: string | null;\n  afterSrc: string | null;\n  gallery: string[];\n  title: string;\n  location: string | null;\n  clientLogoSrc?: string;\n};\n\nexport const beforeAfterGulv: BeforeAfterItem[] = ${JSON.stringify(beforeAfterGulv, null, 2)};\n\nexport const beforeAfterBordplade: BeforeAfterItem[] = ${JSON.stringify(beforeAfterBordplade, null, 2)};\n\nexport const galleryGulv: string[] = ${JSON.stringify(galleryGulv, null, 2)};\n\nexport const galleryBordplade: string[] = ${JSON.stringify(galleryBordplade, null, 2)};\n\nexport const galleryGulvbelaegning: string[] = ${JSON.stringify(galleryGulvbelaegning, null, 2)};\n\nexport const casesManifest: CasesManifestItem[] = ${JSON.stringify(casesManifest, null, 2)};\n`;

  fs.writeFileSync(manifestOut, `${content}\n`, "utf8");
}

const logoFiles = loadLogoFiles();

const gulvCases = buildCategoryCases("gulvafslibning", categoryRoots.gulvafslibning, logoFiles);
const bordpladeCases = buildCategoryCases("bordplade", categoryRoots.bordplade, logoFiles);
const gulvbelaegningCases = buildCategoryCases("gulvbelaegning", categoryRoots.gulvbelaegning, logoFiles);

const casesManifest = [...bordpladeCases, ...gulvCases, ...gulvbelaegningCases];

const beforeAfterGulv = buildLegacyBeforeAfter(gulvCases);
const beforeAfterBordplade = buildLegacyBeforeAfter(bordpladeCases);
const featuredGalleryGulv = buildFeaturedGallery(featuredRoots.gulvafslibning);
const featuredGalleryBordplade = buildFeaturedGallery(featuredRoots.bordplade);
const featuredGalleryGulvbelaegning = buildFeaturedGallery(featuredRoots.gulvbelaegning);
const galleryGulv = featuredGalleryGulv.length ? featuredGalleryGulv : buildLegacyGallery(gulvCases);
const galleryBordplade = featuredGalleryBordplade.length
  ? featuredGalleryBordplade
  : buildLegacyGallery(bordpladeCases);
const galleryGulvbelaegning = featuredGalleryGulvbelaegning.length
  ? featuredGalleryGulvbelaegning
  : buildLegacyGallery(gulvbelaegningCases);

writeManifest({
  beforeAfterGulv,
  beforeAfterBordplade,
  galleryGulv,
  galleryBordplade,
  galleryGulvbelaegning,
  casesManifest
});

console.log(`[media-manifest] gulv cases found: ${beforeAfterGulv.length}`);
console.log(`[media-manifest] bordplade cases found: ${beforeAfterBordplade.length}`);
console.log(`[media-manifest] gulv gallery images: ${galleryGulv.length}`);
console.log(`[media-manifest] bordplade gallery images: ${galleryBordplade.length}`);
console.log(`[media-manifest] gulvbelaegning gallery images: ${galleryGulvbelaegning.length}`);
console.log(`[media-manifest] samlet casesManifest: ${casesManifest.length}`);
