-- Leads (tilbudstid) tabel til MVP.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'tilbudstid',
  service text not null,
  name text not null,
  phone text not null,
  postal_code text not null,
  note text null,
  status text not null default 'new'
);

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

create index if not exists leads_status_idx
  on public.leads (status);

alter table public.leads enable row level security;

drop policy if exists "service-role-full-access-leads" on public.leads;

create policy "service-role-full-access-leads"
  on public.leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

notify pgrst, 'reload schema';
