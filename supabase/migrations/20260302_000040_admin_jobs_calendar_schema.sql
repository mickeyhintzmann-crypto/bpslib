create extension if not exists pgcrypto;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  role text not null default 'worker',
  is_active boolean not null default true,
  calendar_color text
);

alter table if exists public.employees
  add column if not exists role text not null default 'worker',
  add column if not exists is_active boolean not null default true,
  add column if not exists calendar_color text;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  service text,
  location text,
  address text,
  notes text,
  status text not null default 'unassigned',
  start_at timestamptz not null,
  end_at timestamptz not null,
  assigned_employee_id uuid references public.employees(id) on delete set null
);

alter table if exists public.jobs
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists lead_id uuid references public.leads(id) on delete set null,
  add column if not exists service text,
  add column if not exists location text,
  add column if not exists address text,
  add column if not exists notes text,
  add column if not exists status text not null default 'unassigned',
  add column if not exists assigned_employee_id uuid references public.employees(id) on delete set null;

update public.jobs
set status = 'unassigned'
where status is null or btrim(status) = '';

alter table if exists public.jobs
  drop constraint if exists jobs_status_check;

alter table if exists public.jobs
  add constraint jobs_status_check
  check (status in ('unassigned', 'scheduled', 'in_progress', 'done', 'invoiced', 'cancelled'));

alter table if exists public.jobs
  drop constraint if exists jobs_service_check;

alter table if exists public.jobs
  add constraint jobs_service_check
  check (
    service is null
    or service in ('bordplade', 'gulvafslibning', 'gulvbelaegning', 'microcement', 'maler', 'toemrer', 'murer', 'andet')
  );

alter table if exists public.jobs
  drop constraint if exists jobs_start_end_check;

alter table if exists public.jobs
  add constraint jobs_start_end_check
  check (end_at > start_at);

create index if not exists employees_is_active_idx on public.employees(is_active);
create index if not exists jobs_start_at_idx on public.jobs(start_at);
create index if not exists jobs_status_idx on public.jobs(status);
create index if not exists jobs_employee_idx on public.jobs(assigned_employee_id);

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_on_jobs on public.jobs;
create trigger trg_set_updated_at_on_jobs
before update on public.jobs
for each row
execute function public.set_updated_at_timestamp();

alter table public.employees enable row level security;
alter table public.jobs enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('employees', 'jobs')
  loop
    execute format('drop policy if exists %I on %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

create policy employees_admin_all
  on public.employees
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

create policy jobs_admin_all
  on public.jobs
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

revoke all on table public.employees from anon, authenticated;
revoke all on table public.jobs from anon, authenticated;

grant select, insert, update, delete on table public.employees to authenticated;
grant select, insert, update, delete on table public.jobs to authenticated;

notify pgrst, 'reload schema';
