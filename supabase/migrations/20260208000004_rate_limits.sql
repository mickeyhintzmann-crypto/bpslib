create table if not exists public.rate_limits (
  key text primary key,
  count integer not null,
  reset_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.rate_limits enable row level security;

drop policy if exists "service-role-full-access-rate-limits" on public.rate_limits;

create policy "service-role-full-access-rate-limits"
  on public.rate_limits
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.rate_limit_hit(
  p_key text,
  p_window_seconds integer default 3600
)
returns table(count integer, reset_at timestamptz)
language sql
security definer
set search_path = public
as $$
  insert into public.rate_limits as rl (key, count, reset_at)
  values (
    p_key,
    1,
    now() + make_interval(secs => greatest(p_window_seconds, 1))
  )
  on conflict (key)
  do update
    set count = case
      when rl.reset_at < now() then 1
      else rl.count + 1
    end,
    reset_at = case
      when rl.reset_at < now() then now() + make_interval(secs => greatest(p_window_seconds, 1))
      else rl.reset_at
    end
  returning rl.count, rl.reset_at;
$$;

notify pgrst, 'reload schema';
