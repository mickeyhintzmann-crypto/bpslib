alter table public.bookings
  add column if not exists date date,
  add column if not exists start_slot_index int,
  add column if not exists slot_count int default 1;

update public.bookings
set
  date = coalesce(date, slot_start::date),
  start_slot_index = coalesce(
    start_slot_index,
    case
      when slot_start::time = '08:00:00' then 0
      when slot_start::time = '11:00:00' then 1
      when slot_start::time = '13:30:00' then 2
      else null
    end
  ),
  slot_count = coalesce(
    slot_count,
    case
      when slot_start::time = '08:00:00' and slot_end::time = '11:00:00' then 1
      when slot_start::time = '08:00:00' and slot_end::time = '13:30:00' then 2
      when slot_start::time = '08:00:00' and slot_end::time = '16:00:00' then 3
      when slot_start::time = '11:00:00' and slot_end::time = '13:30:00' then 1
      when slot_start::time = '11:00:00' and slot_end::time = '16:00:00' then 2
      when slot_start::time = '13:30:00' and slot_end::time = '16:00:00' then 1
      else null
    end
  )
where slot_start is not null;

create index if not exists bookings_date_idx on public.bookings (date);
create index if not exists bookings_date_slot_idx on public.bookings (date, start_slot_index);

notify pgrst, 'reload schema';
