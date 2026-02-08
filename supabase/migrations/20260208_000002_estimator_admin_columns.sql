alter table public.estimator_requests
  add column if not exists internal_note text,
  add column if not exists price_min integer,
  add column if not exists price_max integer,
  add column if not exists slot_count integer;

create index if not exists estimator_requests_status_idx
  on public.estimator_requests (status);

notify pgrst, 'reload schema';
