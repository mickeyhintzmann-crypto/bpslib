alter table public.estimator_requests
  add column if not exists ai_price_min int,
  add column if not exists ai_price_max int,
  add column if not exists ai_status text;

alter table public.bookings
  add column if not exists estimator_request_id uuid,
  add column if not exists price_estimate_min int,
  add column if not exists price_estimate_max int;
