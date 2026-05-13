create extension if not exists pgcrypto;

create table if not exists public.ai_prompt_versions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  service text not null,
  prompt text not null,
  rules jsonb not null default '{}'::jsonb,
  is_active boolean not null default false
);

alter table if exists public.ai_prompt_versions
  add column if not exists name text not null default 'default',
  add column if not exists service text not null default 'bordplade',
  add column if not exists prompt text not null default '',
  add column if not exists rules jsonb not null default '{}'::jsonb,
  add column if not exists is_active boolean not null default false;

alter table if exists public.ai_prompt_versions
  drop constraint if exists ai_prompt_versions_service_check;

alter table if exists public.ai_prompt_versions
  add constraint ai_prompt_versions_service_check
  check (
    service in ('bordplade', 'gulvafslibning', 'gulvbelaegning', 'microcement', 'maler', 'toemrer', 'murer', 'andet')
  );

create table if not exists public.ai_quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  service text not null,
  lead_id uuid references public.leads(id) on delete set null,
  page_url text,
  utm jsonb not null default '{}'::jsonb,
  inputs jsonb not null,
  images jsonb not null default '[]'::jsonb,
  client_meta jsonb not null default '{}'::jsonb
);

alter table if exists public.ai_quote_requests
  add column if not exists service text not null default 'bordplade',
  add column if not exists lead_id uuid references public.leads(id) on delete set null,
  add column if not exists page_url text,
  add column if not exists utm jsonb not null default '{}'::jsonb,
  add column if not exists inputs jsonb not null default '{}'::jsonb,
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists client_meta jsonb not null default '{}'::jsonb;

alter table if exists public.ai_quote_requests
  drop constraint if exists ai_quote_requests_service_check;

alter table if exists public.ai_quote_requests
  add constraint ai_quote_requests_service_check
  check (
    service in ('bordplade', 'gulvafslibning', 'gulvbelaegning', 'microcement', 'maler', 'toemrer', 'murer', 'andet')
  );

create table if not exists public.ai_quote_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request_id uuid not null references public.ai_quote_requests(id) on delete cascade,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  output jsonb not null,
  confidence numeric,
  needs_review boolean not null default false,
  review_status text not null default 'unreviewed',
  admin_feedback text,
  admin_override jsonb not null default '{}'::jsonb
);

alter table if exists public.ai_quote_results
  add column if not exists request_id uuid references public.ai_quote_requests(id) on delete cascade,
  add column if not exists prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  add column if not exists output jsonb not null default '{}'::jsonb,
  add column if not exists confidence numeric,
  add column if not exists needs_review boolean not null default false,
  add column if not exists review_status text not null default 'unreviewed',
  add column if not exists admin_feedback text,
  add column if not exists admin_override jsonb not null default '{}'::jsonb;

alter table if exists public.ai_quote_results
  drop constraint if exists ai_quote_results_review_status_check;

alter table if exists public.ai_quote_results
  add constraint ai_quote_results_review_status_check
  check (review_status in ('unreviewed', 'approved', 'edited', 'rejected'));

create index if not exists ai_prompt_versions_service_idx
  on public.ai_prompt_versions(service, created_at desc);

create unique index if not exists ai_prompt_versions_active_per_service_idx
  on public.ai_prompt_versions(service)
  where is_active = true;

create index if not exists ai_quote_requests_service_created_idx
  on public.ai_quote_requests(service, created_at desc);

create index if not exists ai_quote_requests_lead_idx
  on public.ai_quote_requests(lead_id);

create index if not exists ai_quote_results_queue_idx
  on public.ai_quote_results(needs_review, review_status, created_at desc);

create index if not exists ai_quote_results_request_idx
  on public.ai_quote_results(request_id);

alter table public.ai_prompt_versions enable row level security;
alter table public.ai_quote_requests enable row level security;
alter table public.ai_quote_results enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('ai_prompt_versions', 'ai_quote_requests', 'ai_quote_results')
  loop
    execute format('drop policy if exists %I on %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

create policy ai_prompt_versions_admin_all
  on public.ai_prompt_versions
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

create policy ai_quote_requests_admin_all
  on public.ai_quote_requests
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

create policy ai_quote_results_admin_all
  on public.ai_quote_results
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

revoke all on table public.ai_prompt_versions from anon, authenticated;
revoke all on table public.ai_quote_requests from anon, authenticated;
revoke all on table public.ai_quote_results from anon, authenticated;

grant select, insert, update, delete on table public.ai_prompt_versions to authenticated;
grant select, insert, update, delete on table public.ai_quote_requests to authenticated;
grant select, insert, update, delete on table public.ai_quote_results to authenticated;

notify pgrst, 'reload schema';
