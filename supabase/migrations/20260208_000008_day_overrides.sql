create table if not exists public.day_overrides (
  date date primary key,
  open_slots_count int not null default 3,
  show_on_acute_page boolean not null default true,
  note text,
  updated_at timestamptz default now()
);

alter table public.day_overrides
  add column if not exists open_slots_count int not null default 3,
  add column if not exists show_on_acute_page boolean not null default true,
  add column if not exists note text,
  add column if not exists updated_at timestamptz default now();

create unique index if not exists day_overrides_date_key on public.day_overrides (date);

notify pgrst, 'reload schema';
