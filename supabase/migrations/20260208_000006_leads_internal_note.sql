-- Tilfoej intern note til leads.

alter table public.leads
  add column if not exists internal_note text;

notify pgrst, 'reload schema';
