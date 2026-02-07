# Launch Checklist

## Environment Variables
Required for production:
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_PASSWORD`

Required for full lead capture (CRM):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional (tracking):
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_GA4_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`

Optional (consent debug):
- `NEXT_PUBLIC_TRACKING_DEBUG=1`

Optional (rate limiting):
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional (Turnstile anti-spam):
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

Optional (notifications):
- `SLACK_WEBHOOK_URL`
- `LEAD_WEBHOOK_URL`
- `LEAD_WEBHOOK_SECRET`

Optional (cron auth):
- `CRON_SECRET`

Optional (email):
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ADMIN_ALERT_EMAIL`

## Supabase Migration Steps
1. Create a Supabase project.
2. Run `/Users/mmtmacbook/Documents/New project/lead-machine-mvp/supabase/schema.sql` in the SQL editor.
3. Confirm `leads`, `partners`, and `lead_status_history` tables are present.
4. Store the Supabase keys in production env.

## GTM Container Setup
- Create a GTM container and add GA4, Google Ads, and Meta tags as needed.
- Map conversions:
  - `lead_submit_success` → primary conversion
  - `whatsapp_click` → optional contact conversion
- Confirm dataLayer events are visible after consent.

## Vercel Cron Setup
Set a cron job to call the SLA endpoint:
- `GET /api/ops/sla`
- Recommended schedule: every 6 hours

## Smoke Tests
- Load `/` and `/areas` with no Supabase env (marketing should work).
- Accept/reject cookies and verify GTM loads only after consent.
- Submit a lead and confirm:
  - `/api/leads` returns `ok: true`
  - lead exists in Supabase
  - `lead_submit_success` fires once
- Log in to `/admin` with `ADMIN_PASSWORD`.
- Update a lead status and assign a partner.
- Check `/api/health` and `/api/ready` responses.
