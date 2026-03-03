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
    path.join(repoRoot, "public", "media", "galleries", "gulv", "before-after"),
    path.join(repoRoot, "public", "media", "galleries:gulv:before-after")
  ],
  bordplade: [
    path.join(repoRoot, "public", "media", "galleries", "bordplade", "before-after"),
    path.join(repoRoot, "public", "media", "galleries:bordplade:before-after")
  ],
  gulvbelaegning: [
    path.join(repoRoot, "public", "media", "cases", "gulvbelaegning"),
    path.join(repoRoot, "public", "media", "cases:gulvbelaegning")
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

function titleFromCaseId(caseId) {
  const cleaned = caseId
    .replace(/^case[-_ ]*\d+[:._-]*/i, "")
    .replace(/[-._:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Case";
  }

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
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
      const gallery = imageFiles.map((imagePath) => toWebPath(imagePath));

      records.push({
        id: `${category}:${caseId}`,
        caseId,
        category,
        title: titleFromCaseId(caseId),
        location: null,
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
    const candidate = item.afterSrc ?? item.gallery[0];
    if (!candidate || seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    gallery.push(candidate);
  }

  return gallery;
}

function writeManifest({
  beforeAfterGulv,
  beforeAfterBordplade,
  galleryGulv,
  galleryBordplade,
  casesManifest
}) {
  const content = `/* eslint-disable */\n// Auto-generated by scripts/generate-media-manifest.mjs\n// Do not edit manually.\n\nexport type BeforeAfterItem = {\n  caseId: string;\n  beforeSrc: string;\n  afterSrc: string;\n};\n\nexport type CasesManifestCategory = "bordplade" | "gulvafslibning" | "gulvbelaegning";\n\nexport type CasesManifestItem = {\n  id: string;\n  caseId: string;\n  category: CasesManifestCategory;\n  beforeSrc: string | null;\n  afterSrc: string | null;\n  gallery: string[];\n  title: string;\n  location: string | null;\n  clientLogoSrc?: string;\n};\n\nexport const beforeAfterGulv: BeforeAfterItem[] = ${JSON.stringify(beforeAfterGulv, null, 2)};\n\nexport const beforeAfterBordplade: BeforeAfterItem[] = ${JSON.stringify(beforeAfterBordplade, null, 2)};\n\nexport const galleryGulv: string[] = ${JSON.stringify(galleryGulv, null, 2)};\n\nexport const galleryBordplade: string[] = ${JSON.stringify(galleryBordplade, null, 2)};\n\nexport const casesManifest: CasesManifestItem[] = ${JSON.stringify(casesManifest, null, 2)};\n`;

  fs.writeFileSync(manifestOut, `${content}\n`, "utf8");
}

const logoFiles = loadLogoFiles();

const gulvCases = buildCategoryCases("gulvafslibning", categoryRoots.gulvafslibning, logoFiles);
const bordpladeCases = buildCategoryCases("bordplade", categoryRoots.bordplade, logoFiles);
const gulvbelaegningCases = buildCategoryCases("gulvbelaegning", categoryRoots.gulvbelaegning, logoFiles);

const casesManifest = [...bordpladeCases, ...gulvCases, ...gulvbelaegningCases];

const beforeAfterGulv = buildLegacyBeforeAfter(gulvCases);
const beforeAfterBordplade = buildLegacyBeforeAfter(bordpladeCases);
const galleryGulv = buildLegacyGallery(gulvCases);
const galleryBordplade = buildLegacyGallery(bordpladeCases);

writeManifest({
  beforeAfterGulv,
  beforeAfterBordplade,
  galleryGulv,
  galleryBordplade,
  casesManifest
});

console.log(`[media-manifest] gulv cases found: ${beforeAfterGulv.length}`);
console.log(`[media-manifest] bordplade cases found: ${beforeAfterBordplade.length}`);
console.log(`[media-manifest] gulv gallery images: ${galleryGulv.length}`);
console.log(`[media-manifest] bordplade gallery images: ${galleryBordplade.length}`);
console.log(`[media-manifest] samlet casesManifest: ${casesManifest.length}`);
