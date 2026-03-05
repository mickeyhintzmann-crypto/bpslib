create extension if not exists pgcrypto;

create table if not exists public.employee_dinero_connections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  connected_by_user_id uuid,
  organization_id text not null,
  api_key_encrypted text not null,
  is_active boolean not null default true,
  last_verified_at timestamptz,
  last_error text,
  unique (employee_id)
);

alter table if exists public.employee_dinero_connections
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists connected_by_user_id uuid,
  add column if not exists organization_id text,
  add column if not exists api_key_encrypted text,
  add column if not exists is_active boolean not null default true,
  add column if not exists last_verified_at timestamptz,
  add column if not exists last_error text;

update public.employee_dinero_connections
set organization_id = coalesce(nullif(btrim(organization_id), ''), 'missing')
where organization_id is null;

update public.employee_dinero_connections
set api_key_encrypted = coalesce(nullif(btrim(api_key_encrypted), ''), 'missing')
where api_key_encrypted is null;

alter table if exists public.employee_dinero_connections
  alter column organization_id set not null;

alter table if exists public.employee_dinero_connections
  alter column api_key_encrypted set not null;

create index if not exists employee_dinero_connections_employee_idx
  on public.employee_dinero_connections(employee_id);

create table if not exists public.job_invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  source text not null default 'dinero',
  status text not null default 'pending',
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  amount_ex_vat numeric(12,2),
  vat_percent numeric(5,2),
  currency text not null default 'DKK',
  description text,
  dinero_contact_id text,
  dinero_invoice_id text,
  dinero_invoice_number text,
  sent_at timestamptz,
  error_message text,
  request_payload jsonb,
  response_payload jsonb,
  unique (job_id)
);

alter table if exists public.job_invoices
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists source text not null default 'dinero',
  add column if not exists status text not null default 'pending',
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists customer_address text,
  add column if not exists amount_ex_vat numeric(12,2),
  add column if not exists vat_percent numeric(5,2),
  add column if not exists currency text not null default 'DKK',
  add column if not exists description text,
  add column if not exists dinero_contact_id text,
  add column if not exists dinero_invoice_id text,
  add column if not exists dinero_invoice_number text,
  add column if not exists sent_at timestamptz,
  add column if not exists error_message text,
  add column if not exists request_payload jsonb,
  add column if not exists response_payload jsonb;

alter table if exists public.job_invoices
  drop constraint if exists job_invoices_source_check;

alter table if exists public.job_invoices
  add constraint job_invoices_source_check
  check (source in ('dinero'));

alter table if exists public.job_invoices
  drop constraint if exists job_invoices_status_check;

alter table if exists public.job_invoices
  add constraint job_invoices_status_check
  check (status in ('pending', 'sent', 'failed'));

create index if not exists job_invoices_employee_idx
  on public.job_invoices(employee_id);

create index if not exists job_invoices_status_idx
  on public.job_invoices(status);

alter table public.employee_dinero_connections enable row level security;
alter table public.job_invoices enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('employee_dinero_connections', 'job_invoices')
  loop
    execute format('drop policy if exists %I on %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

create policy employee_dinero_connections_admin_all
  on public.employee_dinero_connections
  for all
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

create policy job_invoices_admin_all
  on public.job_invoices
  for all
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

revoke all on table public.employee_dinero_connections from anon, authenticated;
revoke all on table public.job_invoices from anon, authenticated;

grant select, insert, update, delete on table public.employee_dinero_connections to authenticated;
grant select, insert, update, delete on table public.job_invoices to authenticated;

drop trigger if exists trg_set_updated_at_on_employee_dinero_connections on public.employee_dinero_connections;
create trigger trg_set_updated_at_on_employee_dinero_connections
before update on public.employee_dinero_connections
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists trg_set_updated_at_on_job_invoices on public.job_invoices;
create trigger trg_set_updated_at_on_job_invoices
before update on public.job_invoices
for each row
execute function public.set_updated_at_timestamp();

notify pgrst, 'reload schema';
