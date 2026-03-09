alter table public.bookings
  add column if not exists extras jsonb;

notify pgrst, 'reload schema';
