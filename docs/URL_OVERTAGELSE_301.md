# URL-overtagelse med 301 (Base44 -> ny app)

## Formål
Den nye app skal overtage alle kendte Base44-URL’er med permanente redirects (301), så SEO-signaler bevares efter Base44 slettes.

## Strategi
- Redirect-laget implementeres i den nye app fra dag 1.
- Alle redirects er 301.
- Vi normaliserer URL’er til lowercase uden trailing slash.
- Querystring bevares ved redirect.

## KNOWN_OLD_PATHS
Minimumsliste (udvides løbende):
- `/TableSanding`
- `/FloorSanding`
- `/BordpladeSlibningRoskilde`
- `/TableSandingCopenhagen`
- `/About`
- `/References`
- `/Guides`
- `/contact`

## Foreløbige mappings
Hvis en mål-side ikke findes i MVP, redirectes der til nærmeste relevante side (typisk `/` eller `/bordplade`).
- `/TableSanding` -> `/bordplade`
- `/FloorSanding` -> `/`
- `/BordpladeSlibningRoskilde` -> `/bordplade`
- `/TableSandingCopenhagen` -> `/bordplade`
- `/About` -> `/om-os`
- `/References` -> `/cases`
- `/Guides` -> `/bordplade`
- `/contact` -> `/kontakt`

## Regler (skal håndhæves)
- Uppercase/mixed-case paths -> 301 til lowercase.
- Trailing slash -> 301 til samme path uden slash.
- Querystring bevares uændret.

## Vedligehold
- Nye gamle paths tilføjes i samme format som ovenfor.
- Når nye sider lanceres, opdateres mappings til mere præcise mål.

