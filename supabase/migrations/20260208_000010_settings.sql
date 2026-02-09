create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

notify pgrst, 'reload schema';
