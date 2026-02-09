#!/usr/bin/env node

const rawBaseUrl = process.env.SITE_URL || process.env.BASE_URL || "https://bpslib.dk";
const baseUrl = rawBaseUrl.replace(/\/+$/, "");
const isProdTarget = /bpslib\.dk/.test(baseUrl) || process.env.CHECK_PROD === "true";

const must200 = [
  "/",
  "/kontakt",
  "/bordpladeslibning/pris",
  "/robots.txt",
  "/sitemap.xml"
];

const failures = [];

const assert = (ok, message) => {
  if (!ok) {
    failures.push(message);
  }
};

const fetchUrl = async (path, options = {}) => {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, options);
  return response;
};

const checkStatus = async (path, method, expected = 200) => {
  try {
    const res = await fetchUrl(path, { method, redirect: "manual" });
    assert(res.status === expected, `[${method}] ${path} -> ${res.status}`);
  } catch (err) {
    assert(false, `[${method}] ${path} -> fejl: ${err?.message || err}`);
  }
};

const checkRobots = async () => {
  try {
    const res = await fetchUrl("/robots.txt");
    assert(res.status === 200, `[robots] status -> ${res.status}`);
    const text = await res.text();
    assert(!/noindex/i.test(text), "[robots] indeholder noindex");
    if (isProdTarget) {
      assert(!/Disallow:\s*\/\s*$/i.test(text), "[robots] blokerer hele sitet i prod");
    }
    const expected = `${baseUrl}/sitemap.xml`;
    const hasExpected = text.includes(`Sitemap: ${expected}`);
    const hasProd = text.includes("Sitemap: https://bpslib.dk/sitemap.xml");
    assert(hasExpected || hasProd, "[robots] Mangler korrekt Sitemap URL");
  } catch (err) {
    assert(false, `[robots] fejl: ${err?.message || err}`);
  }
};

const checkSitemap = async () => {
  try {
    const res = await fetchUrl("/sitemap.xml");
    assert(res.status === 200, `[sitemap] status -> ${res.status}`);
    const text = await res.text();
    assert(!text.includes("/admin"), "[sitemap] Indeholder /admin");
    assert(!text.includes("/api/admin"), "[sitemap] Indeholder /api/admin");
    assert(!text.includes("/tak"), "[sitemap] Indeholder /tak");
    if (isProdTarget) {
      assert(!text.includes("vercel.app"), "[sitemap] Indeholder vercel.app");
    }
  } catch (err) {
    assert(false, `[sitemap] fejl: ${err?.message || err}`);
  }
};

const checkCanonicalAndRobots = async () => {
  try {
    const res = await fetchUrl("/");
    assert(res.status === 200, `[canonical] / status -> ${res.status}`);
    const html = await res.text();
    const canonicalMatch = html.match(/rel=\"canonical\" href=\"([^\"]+)\"/i);
    assert(!!canonicalMatch, "[canonical] Mangler canonical link");
    if (canonicalMatch) {
      const canonical = canonicalMatch[1];
      if (isProdTarget) {
        assert(canonical.startsWith("https://bpslib.dk"), `[canonical] ${canonical}`);
      } else {
        assert(canonical.startsWith(baseUrl), `[canonical] ${canonical}`);
      }
    }
    if (isProdTarget) {
      assert(!/noindex/i.test(html), "[robots] noindex fundet i HTML i prod");
    }
  } catch (err) {
    assert(false, `[canonical] fejl: ${err?.message || err}`);
  }
};

const run = async () => {
  for (const path of must200) {
    await checkStatus(path, "GET", 200);
    await checkStatus(path, "HEAD", 200);
  }
  await checkRobots();
  await checkSitemap();
  await checkCanonicalAndRobots();

  if (failures.length) {
    console.error("Go-Live check fejlede:");
    failures.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }

  console.log("Go-Live check OK.");
};

run();
