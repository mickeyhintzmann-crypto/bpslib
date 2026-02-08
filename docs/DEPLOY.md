# Deployment

## Platform
- Vercel (eller tilsvarende).
- Produktion deployes fra main-branch.

## Miljøvariabler (minimum)
- `NEXT_PUBLIC_SITE_URL` (f.eks. `https://bpslib.dk`)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (kun server-side)
- `GA4_MEASUREMENT_ID` (kan være tom før consent er aktiv)
- `ADMIN_TOKEN` (kræves i produktion til admin API routes, valgfri i dev)
- `RATE_LIMIT_SALT` (til hash af IP i rate limit, brug en lang random streng)

## Supabase klargøring (MVP)
- Kør SQL-migrationen i Supabase SQL Editor:
- `supabase/migrations/20260208_000001_estimator_requests.sql`
- `supabase/migrations/20260208_000002_estimator_admin_columns.sql`
- `supabase/migrations/20260208_000003_estimator_booking_links.sql`
- Migrationen opretter:
- `public.estimator_requests`
- Storage bucket `estimator-images` (private)
- Basale policies til service role.
- Admin-felter til estimator inbox.
- Link mellem estimator og bookings + overlap-beskyttelse på booking-tider.
- Rate-limit tabel og funktion til serverless throttling.

## SEO og robot-regler
- `/admin` og `/api/admin` er disallowed i `robots.txt`.
- Alle `/admin/*` sider er markeret med `noindex, nofollow, nocache`.

## Launch checklist
- [ ] Alle public sider eksisterer (forside, bordplade, pris, prisberegner, booking, akutte tider, tilbudstid, cases, om os, kontakt, privatliv, cookie, handelsbetingelser).
- [ ] URL-regler og canonical er korrekt implementeret.
- [ ] Redirect-lag for Base44 er aktivt (301).
- [ ] `robots.txt` og `sitemap.xml` er public og validerede.
- [ ] Formularer sender data til Supabase.
- [ ] Booking fungerer med slot-baseret logik.
- [ ] Prisberegner uploader filer og opretter manuelt vurderingsflow.
- [ ] Cookie consent klar (selv hvis inaktiv).
- [ ] QA på desktop (primær).
