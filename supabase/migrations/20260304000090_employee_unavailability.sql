create table if not exists public.employee_unavailability (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  created_by_user_id uuid references public.admin_users(id) on delete set null,
  type text not null default 'personal',
  note text,
  start_at timestamptz not null,
  end_at timestamptz not null
);

alter table if exists public.employee_unavailability
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists employee_id uuid references public.employees(id) on delete cascade,
  add column if not exists created_by_user_id uuid references public.admin_users(id) on delete set null,
  add column if not exists type text not null default 'personal',
  add column if not exists note text,
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz;

update public.employee_unavailability
set type = 'personal'
where type is null or btrim(type) = '';

alter table if exists public.employee_unavailability
  drop constraint if exists employee_unavailability_type_check;

alter table if exists public.employee_unavailability
  add constraint employee_unavailability_type_check
  check (type in ('sick', 'vacation', 'personal'));

alter table if exists public.employee_unavailability
  drop constraint if exists employee_unavailability_start_end_check;

alter table if exists public.employee_unavailability
  add constraint employee_unavailability_start_end_check
  check (end_at > start_at);

create index if not exists employee_unavailability_employee_idx
  on public.employee_unavailability(employee_id);

create index if not exists employee_unavailability_start_idx
  on public.employee_unavailability(start_at);

create index if not exists employee_unavailability_end_idx
  on public.employee_unavailability(end_at);

create index if not exists employee_unavailability_employee_start_idx
  on public.employee_unavailability(employee_id, start_at);

drop trigger if exists trg_set_updated_at_on_employee_unavailability on public.employee_unavailability;
create trigger trg_set_updated_at_on_employee_unavailability
before update on public.employee_unavailability
for each row
execute function public.set_updated_at_timestamp();

notify pgrst, 'reload schema';
