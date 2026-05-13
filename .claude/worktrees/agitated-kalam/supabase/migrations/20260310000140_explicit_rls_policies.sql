-- Add explicit deny policies for client roles on RLS-protected tables.
-- This keeps current service-role-only access unchanged while satisfying
-- Security Advisor's "RLS Enabled No Policy" informational checks.

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'audit_log',
    'bookings',
    'day_overrides',
    'employee_unavailability',
    'employees',
    'jobs',
    'leads_backup_20260302',
    'rate_limits',
    'settings'
  ]
  loop
    if to_regclass('public.' || tbl) is not null then
      execute format('alter table public.%I enable row level security;', tbl);

      if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = tbl
          and policyname = 'no_client_access'
      ) then
        execute format(
          'create policy no_client_access on public.%I for all to anon, authenticated using (false) with check (false);',
          tbl
        );
      end if;
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
