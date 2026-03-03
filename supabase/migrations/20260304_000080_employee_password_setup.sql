alter table if exists public.admin_users
  add column if not exists employee_activation_code text,
  add column if not exists employee_password_hash text,
  add column if not exists employee_password_set_at timestamptz;

create index if not exists admin_users_employee_activation_code_idx
  on public.admin_users(employee_activation_code)
  where employee_activation_code is not null and btrim(employee_activation_code) <> '';

notify pgrst, 'reload schema';
