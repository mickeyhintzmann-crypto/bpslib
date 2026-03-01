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
