-- Fase 1: customers-tabel + lead-udvidelser for samlet kundeoverblik.
-- Idempotent – kan køres flere gange.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ─── 1. customers tabel ───────────────────────────────────────────────

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text,
  email text,
  phone text,
  postal_code text,
  address text,
  city text,
  tags jsonb not null default '[]'::jsonb,
  notes text,
  source text not null default 'auto'
);

comment on table public.customers is 'Samlet kundeprofil – forbinder leads, estimater og bookinger.';

-- Unikt index på telefon (primær matchnøgle)
create unique index if not exists customers_phone_unique
  on public.customers (phone)
  where phone is not null and btrim(phone) <> '';

-- Unikt index på email (sekundær matchnøgle)
create unique index if not exists customers_email_unique
  on public.customers (email)
  where email is not null and btrim(email) <> '';

create index if not exists customers_created_at_idx
  on public.customers (created_at desc);

create index if not exists customers_name_idx
  on public.customers using gin (name gin_trgm_ops);

-- Trigger: opdater updated_at automatisk
drop trigger if exists trg_set_updated_at_on_customers on public.customers;
create trigger trg_set_updated_at_on_customers
before update on public.customers
for each row
execute function public.set_updated_at_timestamp();

-- RLS
alter table public.customers enable row level security;

create policy customers_service_role_full
  on public.customers
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy customers_admin_select
  on public.customers
  for select
  to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );

create policy customers_admin_update
  on public.customers
  for update
  to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );

create policy customers_admin_insert
  on public.customers
  for insert
  to authenticated
  with check (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );

revoke all on table public.customers from anon, authenticated;
grant select, insert, update on table public.customers to authenticated;

-- ─── 2. customer_id FK på leads ───────────────────────────────────────

alter table if exists public.leads
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists leads_customer_id_idx
  on public.leads (customer_id)
  where customer_id is not null;

-- ─── 3. Nye felter på leads ───────────────────────────────────────────

alter table if exists public.leads
  add column if not exists priority text not null default 'normal';

alter table if exists public.leads
  add column if not exists assigned_to uuid references public.admin_users(id) on delete set null;

alter table if exists public.leads
  add column if not exists follow_up_at timestamptz;

alter table if exists public.leads
  add column if not exists last_contacted_at timestamptz;

alter table if exists public.leads
  add column if not exists estimated_value integer;

alter table if exists public.leads
  add column if not exists lost_reason text;

-- Constraint for priority
alter table if exists public.leads
  drop constraint if exists leads_priority_check;

alter table if exists public.leads
  add constraint leads_priority_check
  check (priority in ('urgent', 'high', 'normal', 'low'));

create index if not exists leads_priority_idx
  on public.leads (priority);

create index if not exists leads_follow_up_at_idx
  on public.leads (follow_up_at)
  where follow_up_at is not null;

create index if not exists leads_assigned_to_idx
  on public.leads (assigned_to)
  where assigned_to is not null;

-- ─── 4. customer_id FK på estimator_requests ──────────────────────────

alter table if exists public.estimator_requests
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists estimator_requests_customer_id_idx
  on public.estimator_requests (customer_id)
  where customer_id is not null;

-- ─── 5. customer_id FK på bookings ────────────────────────────────────

alter table if exists public.bookings
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists bookings_customer_id_idx
  on public.bookings (customer_id)
  where customer_id is not null;

-- ─── 6. Reload PostgREST schema ──────────────────────────────────────

notify pgrst, 'reload schema';
