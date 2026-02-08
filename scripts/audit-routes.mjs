import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const appDir = path.join(rootDir, "app");
const registryPath = path.join(rootDir, "lib", "site-registry.json");

const registrySource = fs.readFileSync(registryPath, "utf8");
const registryRoutes = JSON.parse(registrySource);
const registryPaths = [...new Set(registryRoutes.map((route) => route.path))];

if (registryPaths.length === 0) {
  console.error("[route-audit] Ingen routes fundet i lib/site-registry.json");
  process.exit(1);
}

const routeToPageFile = (routePath) => {
  if (routePath === "/") {
    return path.join(appDir, "page.tsx");
  }
  return path.join(appDir, routePath.slice(1), "page.tsx");
};

const findPageFiles = (dirPath) => {
  const files = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...findPageFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name === "page.tsx") {
      files.push(fullPath);
    }
  }

  return files;
};

const toRoutePath = (pageFile) => {
  const relativePath = path.relative(appDir, pageFile);
  if (relativePath === "page.tsx") {
    return "/";
  }

  const withoutPage = relativePath.replace(/\\page\.tsx$/, "").replace(/\/page\.tsx$/, "");
  const segments = withoutPage
    .split(path.sep)
    .filter(Boolean)
    .filter((segment) => !segment.startsWith("("))
    .filter((segment) => !segment.startsWith("@"));

  return `/${segments.join("/")}`;
};

const missingRoutes = registryPaths.filter((routePath) => !fs.existsSync(routeToPageFile(routePath)));

const appRoutePaths = [...new Set(findPageFiles(appDir).map(toRoutePath))];
const extraRoutes = appRoutePaths.filter((routePath) => !registryPaths.includes(routePath));

const trailingSlashRoutes = registryPaths.filter(
  (routePath) => routePath !== "/" && routePath.endsWith("/")
);
const uppercaseRoutes = registryPaths.filter((routePath) => routePath !== routePath.toLowerCase());

console.log("[route-audit] Starter kontrol af site-registry");
console.log(`[route-audit] Registry routes: ${registryPaths.length}`);

if (missingRoutes.length > 0) {
  console.error("\n[route-audit] Manglende routes (fejl):");
  missingRoutes.forEach((routePath) => {
    console.error(`- ${routePath} -> mangler fil ${path.relative(rootDir, routeToPageFile(routePath))}`);
  });
}

if (extraRoutes.length > 0) {
  console.warn("\n[route-audit] Ekstra app-routes (advarsel):");
  extraRoutes.forEach((routePath) => {
    console.warn(`- ${routePath}`);
  });
}

if (trailingSlashRoutes.length > 0) {
  console.error("\n[route-audit] Routes med trailing slash (fejl):");
  trailingSlashRoutes.forEach((routePath) => console.error(`- ${routePath}`));
}

if (uppercaseRoutes.length > 0) {
  console.error("\n[route-audit] Routes med uppercase (fejl):");
  uppercaseRoutes.forEach((routePath) => console.error(`- ${routePath}`));
}

const hasErrors =
  missingRoutes.length > 0 || trailingSlashRoutes.length > 0 || uppercaseRoutes.length > 0;

if (hasErrors) {
  process.exit(1);
}

console.log("\n[route-audit] OK: Ingen manglende routes fundet.");
