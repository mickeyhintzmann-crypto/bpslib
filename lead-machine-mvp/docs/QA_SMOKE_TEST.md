# QA Smoke Test (Go/No-Go)

## Cookie Consent + GTM Gating
- Open `/` in a fresh browser profile.
- Banner appears with Accept/Reject/Settings.
- Reject → GTM must not load (no `gtm.js` network call).
- Accept → GTM loads; dataLayer events appear.

## Tracking Debug Panel
- Set `NEXT_PUBLIC_TRACKING_DEBUG=1`.
- Refresh page and confirm panel shows:
  - Consent state
  - UTMs/click IDs
  - Last 20 events

## UTM + Click ID Persistence (30 days)
- Visit: `/?utm_source=qa&utm_campaign=test&gclid=GCLID123&fbclid=FB123&msclkid=MS123&wbraid=WB1&gbraid=GB1`
- Confirm debug panel shows values.
- Refresh another page; values persist.

## Form Submit Single-Fire
- Submit the lead form once.
- Confirm `lead_submit` and `lead_submit_success` only fire once in debug panel.
- Verify `lead_submit_success` includes `conversion_value_eur`.

## Idempotency Replay (same key)
```
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-idemp-123" \
  -d '{"name":"Test","email":"test@example.com","phone":"+34 600 000 000","preferred_contact":"whatsapp","areas":["marbella"],"budget_band":"€500k–€900k","timeline":"1-3m","financing":"cash","purpose":"live","page":{"page_type":"home"}}'
```
- Repeat the same request with the same `Idempotency-Key`.
- Expected: identical `leadId` returned, no duplicate rows.

## Rate Limit
- Send 11+ requests in 15 minutes from the same IP.
- Expected: HTTP 429 with `Retry-After` header.

## Admin Login
- Open `/admin/login` and authenticate with `ADMIN_PASSWORD`.
- Confirm access to `/admin/leads`.

## Auto-Assign + SLA Breach Check
- Confirm auto-assign runs (if configured in 2.1) and partner assignment is visible.
- Call SLA endpoint (with cron secret if set):
```
curl -H "x-cron-secret: <CRON_SECRET>" http://localhost:3001/api/ops/sla
```
- Expected: JSON summary, and Slack/email only when breaches exist.

## Sitemap + Schema Spot Check
- Open `/sitemap.xml` and ensure all area/intent URLs are included.
- View page source on an intent page and confirm FAQ + Breadcrumb schema.

## Health/Ready
```
curl http://localhost:3001/api/health
curl http://localhost:3001/api/ready
```
- `/api/health` returns env booleans.
- `/api/ready` returns ok only when required env is set.
