create extension if not exists pgcrypto;

create table if not exists public.job_media_uploads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  storage_bucket text not null default 'job-media',
  storage_path text not null,
  original_filename text,
  mime_type text,
  file_size_bytes bigint,
  status text not null default 'pending',
  usage_target text,
  review_note text,
  reviewed_by_user_id uuid,
  reviewed_at timestamptz,
  unique (storage_path)
);

alter table if exists public.job_media_uploads
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists storage_bucket text not null default 'job-media',
  add column if not exists storage_path text,
  add column if not exists original_filename text,
  add column if not exists mime_type text,
  add column if not exists file_size_bytes bigint,
  add column if not exists status text not null default 'pending',
  add column if not exists usage_target text,
  add column if not exists review_note text,
  add column if not exists reviewed_by_user_id uuid,
  add column if not exists reviewed_at timestamptz;

update public.job_media_uploads
set storage_path = coalesce(nullif(btrim(storage_path), ''), id::text)
where storage_path is null;

alter table if exists public.job_media_uploads
  alter column storage_path set not null;

alter table if exists public.job_media_uploads
  drop constraint if exists job_media_uploads_status_check;

alter table if exists public.job_media_uploads
  add constraint job_media_uploads_status_check
  check (status in ('pending', 'approved', 'rejected'));

alter table if exists public.job_media_uploads
  drop constraint if exists job_media_uploads_usage_target_check;

alter table if exists public.job_media_uploads
  add constraint job_media_uploads_usage_target_check
  check (usage_target in ('social_ads', 'website', 'both') or usage_target is null);

create index if not exists job_media_uploads_job_created_idx
  on public.job_media_uploads(job_id, created_at desc);

create index if not exists job_media_uploads_status_created_idx
  on public.job_media_uploads(status, created_at desc);

create index if not exists job_media_uploads_employee_created_idx
  on public.job_media_uploads(employee_id, created_at desc);

alter table public.job_media_uploads enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('job_media_uploads')
  loop
    execute format('drop policy if exists %I on %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

create policy job_media_uploads_admin_all
  on public.job_media_uploads
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

revoke all on table public.job_media_uploads from anon, authenticated;
grant select, insert, update, delete on table public.job_media_uploads to authenticated;

drop trigger if exists trg_set_updated_at_on_job_media_uploads on public.job_media_uploads;
create trigger trg_set_updated_at_on_job_media_uploads
before update on public.job_media_uploads
for each row
execute function public.set_updated_at_timestamp();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'job-media',
  'job-media',
  false,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "service-role-upload-job-media" on storage.objects;
drop policy if exists "service-role-read-job-media" on storage.objects;
drop policy if exists "service-role-delete-job-media" on storage.objects;

create policy "service-role-upload-job-media"
  on storage.objects
  for insert
  to service_role
  with check (
    bucket_id = 'job-media'
    and auth.role() = 'service_role'
  );

create policy "service-role-read-job-media"
  on storage.objects
  for select
  to service_role
  using (
    bucket_id = 'job-media'
    and auth.role() = 'service_role'
  );

create policy "service-role-delete-job-media"
  on storage.objects
  for delete
  to service_role
  using (
    bucket_id = 'job-media'
    and auth.role() = 'service_role'
  );

notify pgrst, 'reload schema';
