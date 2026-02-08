-- Estimator MVP: tabel + storage bucket.
-- Kan køres flere gange uden at fejle (idempotent).

create extension if not exists pgcrypto;

create table if not exists public.estimator_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  gating_answer text not null check (gating_answer in ('ja', 'nej', 'ved_ikke')),
  fields jsonb not null default '{}'::jsonb,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'Ny' check (status in ('Ny', 'Under review', 'Tilbud sendt', 'Booket', 'Lukket')),
  retention_delete_at timestamptz not null
);

comment on table public.estimator_requests is 'Prisberegner requests (MVP).';
comment on column public.estimator_requests.gating_answer is 'ja | nej | ved_ikke';
comment on column public.estimator_requests.fields is 'Form-felter som JSON.';
comment on column public.estimator_requests.images is 'Uploadede billeder som JSON array.';

create index if not exists estimator_requests_created_at_idx
  on public.estimator_requests (created_at desc);

create index if not exists estimator_requests_status_created_at_idx
  on public.estimator_requests (status, created_at desc);

create index if not exists estimator_requests_retention_idx
  on public.estimator_requests (retention_delete_at);

alter table public.estimator_requests enable row level security;

drop policy if exists "service-role-full-access-estimator-requests"
  on public.estimator_requests;

create policy "service-role-full-access-estimator-requests"
  on public.estimator_requests
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'estimator-images',
  'estimator-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "service-role-upload-estimator-images" on storage.objects;
drop policy if exists "service-role-read-estimator-images" on storage.objects;
drop policy if exists "service-role-delete-estimator-images" on storage.objects;

create policy "service-role-upload-estimator-images"
  on storage.objects
  for insert
  to service_role
  with check (
    bucket_id = 'estimator-images'
    and auth.role() = 'service_role'
  );

create policy "service-role-read-estimator-images"
  on storage.objects
  for select
  to service_role
  using (
    bucket_id = 'estimator-images'
    and auth.role() = 'service_role'
  );

create policy "service-role-delete-estimator-images"
  on storage.objects
  for delete
  to service_role
  using (
    bucket_id = 'estimator-images'
    and auth.role() = 'service_role'
  );

-- Sikrer at PostgREST schema cache opdateres med det samme.
notify pgrst, 'reload schema';
