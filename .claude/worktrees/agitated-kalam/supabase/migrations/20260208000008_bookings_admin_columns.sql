alter table public.bookings
  add column if not exists status text default 'new',
  add column if not exists source text default 'normal',
  add column if not exists internal_note text,
  add column if not exists customer_email text,
  add column if not exists address text,
  add column if not exists postal_code text;

notify pgrst, 'reload schema';
