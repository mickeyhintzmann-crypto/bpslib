create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text default 'new',
  service_type text not null default 'bordplade',
  source text default 'normal',
  assigned_to uuid references public.admin_users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address text,
  postal_code text,
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  notes text,
  internal_note text,
  estimator_request_id uuid references public.estimator_requests(id) on delete set null,
  extras jsonb,
  price_total int,
  price_net int,
  price_vat int,
  manage_token text not null default gen_random_uuid()::text,
  images jsonb,
  retention_delete_at timestamptz,
  price_estimate_min int,
  price_estimate_max int
);

create unique index if not exists bookings_manage_token_key on public.bookings (manage_token);
create index if not exists bookings_slot_start_idx on public.bookings (slot_start);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_source_idx on public.bookings (source);

notify pgrst, 'reload schema';
