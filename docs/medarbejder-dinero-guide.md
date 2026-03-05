# Medarbejderguide: Dinero-fakturering i kalenderen

## Formål
Denne guide viser, hvordan du forbinder Dinero på din medarbejderprofil, afslutter opgaver og sender faktura med det samme.

## 1) Første opsætning (kun én gang)
1. Log ind på medarbejderportalen (`/medarbejder/kalender`).
2. Find boksen **Dinero fakturering**.
3. Udfyld:
   - `Organization-id`
   - `Dinero API-nøgle`
4. Klik **Forbind Dinero**.
5. Når status viser *Forbundet*, er du klar til at fakturere.

## 2) Sådan afslutter du en opgave
1. Vælg opgaven i kalenderen.
2. Klik **Afslut opgave og send faktura**.
3. Kontroller/redigér felterne:
   - Kundenavn
   - Email
   - Telefon
   - Adresse
   - Beskrivelse
   - Pris ex. moms
   - Moms %
4. Klik **Godkend og send faktura**.

Systemet opretter kontakt og faktura i Dinero, sender fakturaen til kunden og opdaterer jobstatus til `invoiced`.

## 3) Hvilke kundeoplysninger overføres automatisk
Fra opgaven/leaden prefyldes følgende:
- Navn
- Adresse/lokation
- Telefon
- Email
- Pris (hvis tilgængelig fra jobestimat)
- Moms (standard 25%, kan redigeres)

## 4) Hvis noget fejler
- Hvis Dinero ikke er forbundet: forbind i boksen øverst først.
- Hvis afsendelse fejler: ret data og prøv igen fra samme opgave.
- Fejl vises direkte i medarbejdervisningen.

## 5) Driftsnoter
- API-nøglen gemmes krypteret.
- Faktura-log gemmes per job, så man kan se om den er sendt eller fejlet.
- Et job med sendt faktura markeres som `invoiced`.
