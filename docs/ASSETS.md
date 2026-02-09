# Assets og billeder

## Filstruktur (local images i `/public`)
- `public/images/brand/logo-placeholder.svg`
- `public/images/brand/favicon.png`
- `public/images/home/hero.jpg`
- `public/images/placeholders/fallback.jpg`
- `public/images/cases/` (alle case-billeder)

## Filnavngivning vi forventer
- Hero: `public/images/home/hero.jpg`
- Cases før/efter:
- `public/images/cases/<case-slug>-before.jpg`
- `public/images/cases/<case-slug>-after.jpg`
- Eksempler på `case-slug`: `dybe-ridser`, `olie`, `lak`, `skjolder`, `ridser`, `pris-hub`

## Anbefalede dimensioner
- Hero: `1600x900`
- Before/after: `1200x900`
- Procesbilleder: `1200x800`

## Sådan udskifter du placeholders
1. Behold samme filnavn og læg den nye fil i samme sti under `public/images/...`.
2. Hvis du tilføjer en ny case-slug, opret filerne i `public/images/cases/` og tilføj sluggen i `lib/assets.ts`.
3. Hvis et case-billede mangler, falder komponenterne automatisk tilbage til `public/images/placeholders/fallback.jpg`.

## Note om komponenter
- Brug `components/BpsImage.tsx` i stedet for direkte `next/image`, så fallback, sizes og lazy-loading er ens på hele sitet.
