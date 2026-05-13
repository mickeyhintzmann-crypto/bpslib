alter table if exists public.employees
  add column if not exists email text;

create unique index if not exists employees_email_unique_idx
  on public.employees (lower(email))
  where email is not null and btrim(email) <> '';

notify pgrst, 'reload schema';
