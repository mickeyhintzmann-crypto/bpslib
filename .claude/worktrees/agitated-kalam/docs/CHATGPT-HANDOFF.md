# ChatGPT Handoff Guide

Brug denne guide når du starter en ny ChatGPT-chat for projektet.

## Hurtig brug

Kør:

```bash
scripts/generate-chatgpt-handoff.sh
```

Eller gem seneste handoff til fil:

```bash
scripts/generate-chatgpt-handoff.sh --save
```

## Copy/paste til ny chat

Tag outputtet og indsæt det direkte i ny chat, og udfyld:

- `Aktuelt mål i denne chat`

## Regler

- Arbejd kun i dette projekt.
- Ingen cross-project ændringer.
- Bekræft altid branch, status og scope før ændringer.
- Brug små commits med tydelig changelog.
