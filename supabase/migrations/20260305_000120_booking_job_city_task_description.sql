alter table if exists public.bookings
  add column if not exists city text,
  add column if not exists task_description text;

alter table if exists public.jobs
  add column if not exists city text,
  add column if not exists task_description text;

update public.bookings
set
  task_description = coalesce(task_description, notes)
where task_description is null
  and notes is not null;

update public.jobs
set
  city = coalesce(city, location),
  task_description = coalesce(task_description, notes)
where (city is null and location is not null)
   or (task_description is null and notes is not null);

notify pgrst, 'reload schema';
