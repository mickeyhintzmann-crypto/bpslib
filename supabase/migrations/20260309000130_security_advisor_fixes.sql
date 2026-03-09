-- Fixes Supabase Security Advisor findings for public tables and functions.

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'rate_limits',
    'bookings',
    'employees',
    'jobs',
    'day_overrides',
    'leads_backup_20260302',
    'settings',
    'audit_log',
    'employee_unavailability'
  ]
  loop
    if to_regclass('public.' || tbl) is not null then
      execute format('alter table public.%I enable row level security;', tbl);
    end if;
  end loop;
end $$;

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop function if exists public.rate_limit_hit(text, integer);

create or replace function public.rate_limit_hit(
  p_key text,
  p_window_seconds integer default 3600
)
returns table(count integer, reset_at timestamptz)
language sql
security definer
set search_path = ''
as $$
  insert into public.rate_limits as rl (key, count, reset_at)
  values (
    p_key,
    1,
    now() + make_interval(secs => greatest(p_window_seconds, 1))
  )
  on conflict (key)
  do update
    set count = case
      when rl.reset_at < now() then 1
      else rl.count + 1
    end,
    reset_at = case
      when rl.reset_at < now() then now() + make_interval(secs => greatest(p_window_seconds, 1))
      else rl.reset_at
    end
  returning rl.count, rl.reset_at;
$$;

alter table if exists public.leads
  drop constraint if exists leads_source_check;

alter table if exists public.leads
  add constraint leads_source_check
  check (source in ('form', 'ai_quote', 'booking', 'manual', 'import', 'ombooking'));

drop policy if exists leads_public_insert on public.leads;

create policy leads_public_insert
  on public.leads
  for insert
  to anon
  with check (
    coalesce(status, 'new') = 'new'
    and coalesce(source, 'form') in ('form', 'ai_quote', 'booking')
    and (
      nullif(btrim(coalesce(name, '')), '') is not null
      or nullif(btrim(coalesce(email, '')), '') is not null
      or nullif(btrim(coalesce(phone, '')), '') is not null
      or nullif(btrim(coalesce(message, '')), '') is not null
    )
    and jsonb_typeof(coalesce(utm, '{}'::jsonb)) = 'object'
    and jsonb_typeof(coalesce(meta, '{}'::jsonb)) = 'object'
  );

grant insert on table public.leads to anon;

notify pgrst, 'reload schema';
