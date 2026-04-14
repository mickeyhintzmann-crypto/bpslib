-- Tilføj mulighed for at lukke enkelte slots (fx kun 11:00) uden at lukke hele dagen.
-- blocked_slot_indices indeholder indekser (0=08:00, 1=11:00, 2=13:30) der er blokeret.

alter table if exists public.day_overrides
  add column if not exists blocked_slot_indices int[] not null default '{}';

comment on column public.day_overrides.blocked_slot_indices is
  'Specifikke slots der er lukket (0=08:00, 1=11:00, 2=13:30). Uafhængig af open_slots_count.';

notify pgrst, 'reload schema';
