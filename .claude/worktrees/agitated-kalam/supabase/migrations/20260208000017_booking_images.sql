alter table if exists public.bookings
  add column if not exists images jsonb;

alter table if exists public.bookings
  add column if not exists retention_delete_at timestamptz;
