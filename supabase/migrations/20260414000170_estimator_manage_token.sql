-- Prisberegner-manage-flow: kunder kan se/godkende deres foreløbige pris
-- via et unikt manage-token-link, med status pending/approved/adjusted.

alter table if exists public.estimator_requests
  add column if not exists manage_token text,
  add column if not exists customer_approval_status text not null default 'pending',
  add column if not exists admin_adjustment_note text,
  add column if not exists approved_at timestamptz;

-- Backfill eksisterende rows med unikke tokens
update public.estimator_requests
set manage_token = gen_random_uuid()::text
where manage_token is null;

-- Gør token unikt for fremtidige indsættelser
create unique index if not exists estimator_requests_manage_token_idx
  on public.estimator_requests(manage_token);

-- Statusvalidering
alter table if exists public.estimator_requests
  drop constraint if exists estimator_requests_customer_approval_check;

alter table if exists public.estimator_requests
  add constraint estimator_requests_customer_approval_check
  check (customer_approval_status in ('pending', 'approved', 'adjusted'));

comment on column public.estimator_requests.manage_token is
  'Unikt token der bruges i kundens manage-link (/prisberegner/manage/[token]).';
comment on column public.estimator_requests.customer_approval_status is
  'pending = afventer admin, approved = pris bekræftet, adjusted = pris rettet af admin.';

notify pgrst, 'reload schema';
