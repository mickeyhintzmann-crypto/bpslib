create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  meta jsonb,
  ip text,
  user_agent text
);

notify pgrst, 'reload schema';
