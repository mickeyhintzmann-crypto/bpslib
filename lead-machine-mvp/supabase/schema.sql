-- Extensions
create extension if not exists "pgcrypto";

-- Leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new',
  status_updated_at timestamptz not null default now(),
  name text,
  email text,
  phone text,
  preferred_contact text,
  areas text[] not null default '{}',
  budget_band text,
  budget_min int,
  budget_max int,
  timeline text,
  financing text,
  purpose text,
  must_haves text[] default '{}',
  notes text,
  lead_score int not null default 0,
  idempotency_key text,
  request_ip text,
  user_agent text,
  page_type text,
  area text,
  intent text,
  utm jsonb,
  consent_state jsonb,
  assigned_partner_ids uuid[] default '{}',
  qualified_at timestamptz,
  assigned_at timestamptz,
  contacted_at timestamptz,
  booked_at timestamptz,
  offered_at timestamptz,
  closed_at timestamptz
);

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create unique index if not exists leads_idempotency_key_idx on public.leads(idempotency_key) where idempotency_key is not null;

-- Partners
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  email text,
  phone text,
  areas text[] default '{}',
  intents text[] default '{}',
  is_active boolean default true,
  notes text
);

-- Lead status history
create table if not exists public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  from_status text,
  to_status text,
  changed_at timestamptz not null default now()
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();
