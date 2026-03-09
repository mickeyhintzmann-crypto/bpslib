create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new',
  source text not null default 'form',
  service text,
  name text,
  email text,
  phone text,
  location text,
  message text,
  page_url text,
  utm jsonb not null default '{}'::jsonb,
  meta jsonb not null default '{}'::jsonb
);

alter table if exists public.leads
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists source text not null default 'form',
  add column if not exists location text,
  add column if not exists message text,
  add column if not exists page_url text,
  add column if not exists utm jsonb not null default '{}'::jsonb,
  add column if not exists meta jsonb not null default '{}'::jsonb,
  add column if not exists email text;

alter table if exists public.leads
  alter column service drop not null;

update public.leads
set source = 'form'
where source is null or btrim(source) = '';

update public.leads
set status = 'new'
where status is null or btrim(status) = '';

alter table if exists public.leads
  drop constraint if exists leads_status_check;

alter table if exists public.leads
  add constraint leads_status_check
  check (status in ('new', 'in_progress', 'awaiting_customer', 'won', 'lost'));

alter table if exists public.leads
  drop constraint if exists leads_source_check;

alter table if exists public.leads
  add constraint leads_source_check
  check (source in ('form', 'ai_quote', 'booking', 'manual', 'import'));

alter table if exists public.leads
  drop constraint if exists leads_service_check;

alter table if exists public.leads
  add constraint leads_service_check
  check (
    service is null
    or service in ('bordplade', 'gulvafslibning', 'gulvbelaegning', 'microcement', 'maler', 'toemrer', 'murer', 'andet')
  );

create table if not exists public.lead_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  kind text not null default 'note',
  channel text not null default 'admin',
  content text not null,
  created_by uuid null
);

alter table if exists public.lead_messages
  drop constraint if exists lead_messages_kind_check;

alter table if exists public.lead_messages
  add constraint lead_messages_kind_check
  check (kind in ('note', 'inbound', 'outbound'));

alter table if exists public.lead_messages
  drop constraint if exists lead_messages_channel_check;

alter table if exists public.lead_messages
  add constraint lead_messages_channel_check
  check (channel in ('admin', 'form', 'ai', 'booking', 'email', 'phone', 'whatsapp'));

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_source_idx on public.leads(source);
create index if not exists leads_service_idx on public.leads(service);
create index if not exists lead_messages_lead_idx on public.lead_messages(lead_id, created_at);

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_on_leads on public.leads;
create trigger trg_set_updated_at_on_leads
before update on public.leads
for each row
execute function public.set_updated_at_timestamp();

alter table public.leads enable row level security;
alter table public.lead_messages enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('leads', 'lead_messages')
  loop
    execute format('drop policy if exists %I on %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- Leads: public insert, admin read/update/delete
create policy leads_public_insert
  on public.leads
  for insert
  to public
  with check (true);

create policy leads_admin_select
  on public.leads
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy leads_admin_update
  on public.leads
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy leads_admin_delete
  on public.leads
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

-- Lead messages: admin select/insert
create policy lead_messages_admin_select
  on public.lead_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy lead_messages_admin_insert
  on public.lead_messages
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

revoke all on table public.leads from anon, authenticated;
revoke all on table public.lead_messages from anon, authenticated;

grant insert on table public.leads to anon, authenticated;
grant select, update, delete on table public.leads to authenticated;
grant select, insert on table public.lead_messages to authenticated;

notify pgrst, 'reload schema';
