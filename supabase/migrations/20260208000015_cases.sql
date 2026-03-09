create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'published',
  category text not null,
  title text not null,
  location text not null,
  finish text not null,
  problem text not null,
  before_image text not null,
  after_image text null,
  before_alt text null,
  after_alt text null
);

alter table public.cases enable row level security;

create policy "deny all" on public.cases
  for all
  using (false)
  with check (false);
