#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const assetsPath = join(rootDir, "lib", "assets.ts");
const publicDir = join(rootDir, "public");

const fileExists = (path) => existsSync(path);

const extractImagePaths = (content) => {
  const matches = content.match(/"\/images\/[^"]+"/g) || [];
  return Array.from(
    new Set(
      matches.map((item) => item.replace(/^"/, "").replace(/"$/, ""))
    )
  );
};

const classifyPath = (path) => {
  const lower = path.toLowerCase();
  if (lower.includes("placeholder") || lower.includes("fallback") || lower.includes("/placeholders/")) {
    return "placeholder";
  }
  return "ok";
};

if (!fileExists(assetsPath)) {
  console.error("Mangler lib/assets.ts");
  process.exit(1);
}

const content = readFileSync(assetsPath, "utf8");
const imagePaths = extractImagePaths(content);

const missing = [];
const placeholders = [];
let okCount = 0;

imagePaths.forEach((path) => {
  if (!path.startsWith("/images/")) {
    return;
  }
  const filePath = join(publicDir, path);
  if (!fileExists(filePath)) {
    missing.push(path);
    return;
  }
  if (classifyPath(path) === "placeholder") {
    placeholders.push(path);
    return;
  }
  okCount += 1;
});

const printList = (label, items) => {
  console.log(`${label}:`);
  if (items.length === 0) {
    console.log("- (ingen)");
    return;
  }
  items.forEach((item) => console.log(`- ${item}`));
};

printList("MISSING", missing);
printList("PLACEHOLDER", placeholders);
console.log(`OK: ${okCount}`);

if (missing.length > 0) {
  process.exit(1);
}
