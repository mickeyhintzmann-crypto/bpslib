create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text unique not null,
  name text not null,
  role text not null default 'admin',
  phone text,
  is_active boolean not null default true
);

create index if not exists admin_users_role_idx on public.admin_users(role);

alter table public.audit_log
  add column if not exists role text;

alter table public.bookings
  add column if not exists assigned_to uuid references public.admin_users(id),
  add column if not exists price_total int,
  add column if not exists price_net int,
  add column if not exists price_vat int;

alter table public.leads
  add column if not exists next_follow_up_at timestamptz;

alter table public.estimator_requests
  add column if not exists ai_suggestion_json jsonb,
  add column if not exists final_offer_json jsonb;

notify pgrst, 'reload schema';
