# Email-notifications (Leads, AI, Jobs)

Denne opsætning sender admin-notifications via Resend for:

- Nye leads
- Nye AI quotes til review
- Jobs (oprettet + relevante opdateringer)

## 1) Environment variables

Sæt disse i Vercel (Production + Preview efter behov):

```bash
RESEND_API_KEY=...
NOTIFY_EMAIL_FROM="BPSLIB <no-reply@bpslib.dk>"
NOTIFY_EMAIL_TO="mickey.hintzmann@icloud.com,info@bpslib.dk"
APP_BASE_URL="https://bpslib.dk"
```

Toggles:

```bash
NOTIFY_LEADS_ENABLED=true
NOTIFY_AI_ENABLED=true
NOTIFY_JOBS_ENABLED=true
```

## 2) Resend setup

1. Opret Resend-konto.
2. Verificér sender-domæne for `NOTIFY_EMAIL_FROM`.
3. Indsæt `RESEND_API_KEY` i Vercel env vars.

## 3) Gradvis aktivering (anbefalet)

1. Start med `NOTIFY_LEADS_ENABLED=true`, de øvrige `false`.
2. Verificér mails i indbakke.
3. Slå `NOTIFY_AI_ENABLED=true` til.
4. Slå `NOTIFY_JOBS_ENABLED=true` til.

## 4) Anti-spam regel for job-opdateringer

Ved PATCH på jobs sendes mail kun hvis mindst ét af disse felter ændres:

- `assigned_employee_id`
- `start_at`
- `end_at`
- `status`

Ændringer i fx noter/almen tekst sender ikke mail.
