# QA SEO Fase 2

## Del A - Legacy redirects (301)

Kør lokal server på port 3002 før tests.

### Manuel 301 test

```bash
curl -I http://localhost:3002/TableSandingCopenhagen
# Forventet: HTTP/1.1 301 ...
# Location: /bordpladeslibning-koebenhavn

curl -I http://localhost:3002/About
# Forventet: HTTP/1.1 301 ...
# Location: /om-os

curl -I http://localhost:3002/Contact
# Forventet: HTTP/1.1 301 ...
# Location: /kontakt

curl -I http://localhost:3002/FloorSanding
# Forventet: HTTP/1.1 301 ...
# Location: /gulvafslibning-sjaelland
```

### Ekstra checks

```bash
curl -I http://localhost:3002/floorSanding
# Forventet: HTTP/1.1 301 ...
# Location: /gulvafslibning-sjaelland
```

- Verificer at der ikke opstår redirect loops.
- Verificer at canonical er selvrefererende på nøglesider.

## Del C - Tracking + UTM

### Tracking sanity (no-op uden gtag)

- Bekræft at siden fungerer uden JavaScript-fejl, selv hvis `window.gtag` ikke findes.
- Klik på en `tel:`-link og bekræft at UI-flow fortsætter normalt.
- Klik på "Book tilbudstid" links og bekræft at navigation fungerer normalt.

### UTM inclusion i payload

1. Åbn eksempelvis:
   `http://localhost:3002/tilbudstid?utm_source=google&utm_medium=cpc&utm_campaign=fase2&utm_term=gulv&utm_content=ad_a`
2. Indsend formular på `/tilbudstid` og verificer i network payload at `utm` objekt sendes.
3. Indsend formular på `/kontakt` med tilsvarende UTM og verificer at `utm` objekt sendes.
4. Verificer i lead-data at UTM gemmes (via eksisterende JSONB-felt hvis tilgængeligt, ellers fallback i tekstfelt).

## Del D - Nye hubs og alias

### Hubs i sitemap

```bash
curl -s http://localhost:3002/sitemap.xml | rg "gulvlaegning-sjaelland|microcement-sjaelland"
# Forventet: begge URL'er findes i sitemap
```

### Alias redirect test

```bash
curl -I http://localhost:3002/gulvbelaegning-sjaelland
# Forventet: HTTP/1.1 301 ...
# Location: /gulvlaegning-sjaelland
```
