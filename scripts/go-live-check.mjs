#!/usr/bin/env node

const baseUrl = (process.env.BASE_URL || "http://localhost:3002").replace(/\/+$/, "");

const must200 = [
  "/",
  "/bordpladeslibning-sjaelland",
  "/bordpladeslibning/pris",
  "/bordpladeslibning/prisberegner",
  "/bordpladeslibning/book",
  "/akutte-tider",
  "/tilbudstid",
  "/kontakt",
  "/cases",
  "/robots.txt",
  "/sitemap.xml"
];

const takPages = ["/tilbudstid/tak", "/akutte-tider/tak", "/bordpladeslibning/book/tak"];

const failures = [];

const fetchUrl = async (path, options = {}) => {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, options);
  return response;
};

const assert = (ok, message) => {
  if (!ok) {
    failures.push(message);
  }
};

const checkStatus200 = async () => {
  for (const path of must200) {
    try {
      const res = await fetchUrl(path, { redirect: "manual" });
      assert(res.status === 200, `[200] ${path} -> ${res.status}`);
    } catch (err) {
      assert(false, `[200] ${path} -> fejl: ${err?.message || err}`);
    }
  }
};

const checkRobots = async () => {
  try {
    const res = await fetchUrl("/robots.txt");
    const text = await res.text();
    assert(text.includes("Disallow: /admin"), "[robots] Mangler Disallow: /admin");
    assert(text.includes("Disallow: /api/admin"), "[robots] Mangler Disallow: /api/admin");

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
    const text = await res.text();
    assert(!text.includes("/admin"), "[sitemap] Indeholder /admin");
    assert(!text.includes("/api/admin"), "[sitemap] Indeholder /api/admin");
    assert(!text.includes("/tak"), "[sitemap] Indeholder /tak");
  } catch (err) {
    assert(false, `[sitemap] fejl: ${err?.message || err}`);
  }
};

const checkRedirect = async () => {
  try {
    const res = await fetchUrl("/TableSanding", { method: "HEAD", redirect: "manual" });
    const location = res.headers.get("location") || "";
    assert(res.status === 301, `[redirect] /TableSanding status -> ${res.status}`);
    assert(
      location.includes("/bordpladeslibning-sjaelland"),
      `[redirect] /TableSanding Location -> ${location || "mangler"}`
    );

    if (location) {
      const finalUrl = location.startsWith("http") ? location : `${baseUrl}${location}`;
      const finalRes = await fetch(finalUrl, { redirect: "manual" });
      assert(finalRes.status === 200, `[redirect] Final status -> ${finalRes.status}`);
    }
  } catch (err) {
    assert(false, `[redirect] fejl: ${err?.message || err}`);
  }
};

const checkNoindex = async () => {
  for (const path of takPages) {
    try {
      const res = await fetchUrl(path, { redirect: "manual" });
      if (res.status === 404) {
        continue;
      }
      const html = await res.text();
      const hasNoindex =
        html.includes('name="robots"') && html.toLowerCase().includes("noindex");
      assert(hasNoindex, `[noindex] ${path} mangler noindex meta`);
    } catch (err) {
      assert(false, `[noindex] ${path} fejl: ${err?.message || err}`);
    }
  }
};

const run = async () => {
  await checkStatus200();
  await checkRobots();
  await checkSitemap();
  await checkRedirect();
  await checkNoindex();

  if (failures.length) {
    console.error("Go-Live check fejlede:");
    failures.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }

  console.log("Go-Live check OK.");
};

run();
