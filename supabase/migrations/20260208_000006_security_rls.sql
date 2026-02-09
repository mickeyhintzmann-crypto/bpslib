do $$
declare
  tbl text;
  pol record;
begin
  foreach tbl in array array[
    'estimator_requests',
    'bookings',
    'leads',
    'day_overrides',
    'rate_limits',
    'audit_log',
    'settings',
    'email_log'
  ]
  loop
    if to_regclass('public.' || tbl) is not null then
      execute format('alter table public.%I enable row level security;', tbl);

      for pol in
        select policyname
        from pg_policies
        where schemaname = 'public'
          and tablename = tbl
      loop
        execute format('drop policy if exists %I on public.%I;', pol.policyname, tbl);
      end loop;

      execute format(
        'create policy deny_all_anon on public.%I for all to anon using (false) with check (false);',
        tbl
      );
      execute format(
        'create policy deny_all_auth on public.%I for all to authenticated using (false) with check (false);',
        tbl
      );
    end if;
  end loop;
end $$;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Storage hardening for estimator-images
update storage.buckets
set public = false
where name = 'estimator-images';

alter table storage.objects enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
  loop
    execute format('drop policy if exists %I on storage.objects;', pol.policyname);
  end loop;
end $$;

create policy deny_estimator_images_anon
  on storage.objects
  for all
  to anon
  using (bucket_id = 'estimator-images' and false)
  with check (bucket_id = 'estimator-images' and false);

create policy deny_estimator_images_auth
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'estimator-images' and false)
  with check (bucket_id = 'estimator-images' and false);

notify pgrst, 'reload schema';
