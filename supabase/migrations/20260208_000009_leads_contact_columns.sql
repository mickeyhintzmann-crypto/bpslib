alter table public.leads
  add column if not exists email text,
  add column if not exists message text;

notify pgrst, 'reload schema';
