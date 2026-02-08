# Tekniske beslutninger

## Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend og data
- Supabase til database, auth, storage og RLS.
- RLS som standard på alle tabeller.

## Analytics og consent
- GA4 events implementeres fra start.
- Cookie consent er klargjort, men kan aktiveres efter launch.
- Indtil consent er aktiv: ingen tracking uden brugeraccept.

## Hosting
- Vercel (eller tilsvarende) til produktion.
- Edge middleware til URL-normalisering og redirects.

