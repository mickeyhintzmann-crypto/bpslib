alter table public.bookings
  add column if not exists manage_token text;

update public.bookings
set manage_token = gen_random_uuid()::text
where manage_token is null;

alter table public.bookings
  alter column manage_token set not null,
  alter column manage_token set default gen_random_uuid()::text;

create unique index if not exists bookings_manage_token_key on public.bookings (manage_token);

notify pgrst, 'reload schema';
