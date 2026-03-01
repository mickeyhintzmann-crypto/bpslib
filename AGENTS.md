# BPSLIB – Agent Rules (SEO safety)

## Non-negotiables
- Do NOT change existing live URLs (no renames, no moves, no trailing-slash changes).
- Do NOT delete pages that have impressions/traffic.
- Redirects: only ADD 301 mappings (never remove existing good mappings).
- Keep canonical, robots.txt, sitemap generation and URL normalization logic intact unless fixing a clear bug.
- Keep 1 page = 1 primary intent (avoid cannibalization).
- Do not mass-edit all location pages with the same template text.

## Must-pass checks before commit
- npm run check:routes
- npm run build

## Manual smoke tests
- Verify key legacy paths 301 to correct targets (TableSanding*, About, Contact, FloorSanding, References, Guides).
- Verify no “lead-gen” / “placeholder” text appears in public pages.
- Verify new pages appear in sitemap and are indexable.
- Verify canonical is self-referential on key pages.

## Work style
- Make a short plan first.
- Prefer minimal diffs and additive changes.
- After changes: provide a short changelog with file list.
