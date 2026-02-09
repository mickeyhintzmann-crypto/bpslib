create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  kind text not null,
  to_email text not null,
  subject text not null,
  ok boolean not null,
  error text null,
  meta jsonb null
);

notify pgrst, 'reload schema';
