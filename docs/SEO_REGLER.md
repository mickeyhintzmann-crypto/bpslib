# SEO-regler

## URL-regler
- Kun lowercase.
- Bindestreger mellem ord.
- Ingen trailing slash.
- Eksempler: `/kontakt`, `/bordplade-pris`, `/tilbudstid`.

## Canonical
- Canonical skal altid pege på lowercase uden trailing slash.
- Canonical må ikke inkludere tracking-parametre.

## Redirects
- Uppercase/mixed-case paths -> 301 til lowercase.
- Trailing slash -> 301 til samme path uden slash.
- Bevar querystring ved redirect.

## Robots og sitemap
- `robots.txt`:
  - Tillad indeksering af offentlige sider.
  - Blokér evt. administrative paths (f.eks. `/admin`, `/api`).
- `sitemap.xml`:
  - Inkludér alle public pages.
  - Opdatér ved deploy.

## Schema.org
Brug struktureret data når indholdet vises:
- `LocalBusiness` for virksomhedsinfo.
- `Service` for service-sider.
- `FAQPage` hvor FAQ-sektion er synlig.

## Intern linking (5-links reglen)
- Hver public side skal have minimum 5 interne links.
- Links skal være relevante og ikke gentagelser af samme mål.
- Primære sider (forside, bordplade, pris, booking) skal have flest indgående links.

## Indeksering og indhold
- Unikt H1 pr. side.
- Meta title og description på alle public pages.
- Ingen tynde sider uden klart formål.

