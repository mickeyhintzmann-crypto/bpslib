do $$
begin
  if to_regclass('public.bookings') is null then
    raise notice 'Tabellen public.bookings findes ikke endnu. Springer bookings-kolonner over.';
  else
    alter table public.bookings
      add column if not exists estimator_request_id uuid,
      add column if not exists source text;
  end if;
end $$;

do $$
begin
  if to_regclass('public.estimator_requests') is null then
    raise notice 'Tabellen public.estimator_requests findes ikke endnu. Springer booking-link kolonne over.';
  else
    alter table public.estimator_requests
      add column if not exists booking_id uuid;
  end if;
end $$;

do $$
begin
  if to_regclass('public.bookings') is not null and to_regclass('public.estimator_requests') is not null then
    alter table public.bookings
      drop constraint if exists bookings_estimator_request_id_fkey;

    alter table public.bookings
      add constraint bookings_estimator_request_id_fkey
      foreign key (estimator_request_id)
      references public.estimator_requests(id)
      on delete set null;

    alter table public.estimator_requests
      drop constraint if exists estimator_requests_booking_id_fkey;

    alter table public.estimator_requests
      add constraint estimator_requests_booking_id_fkey
      foreign key (booking_id)
      references public.bookings(id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if to_regclass('public.bookings') is not null then
    create index if not exists bookings_estimator_request_id_idx
      on public.bookings (estimator_request_id);
  end if;
end $$;

do $$
begin
  if to_regclass('public.estimator_requests') is not null then
    create index if not exists estimator_requests_booking_id_idx
      on public.estimator_requests (booking_id);
  end if;
end $$;

do $$
begin
  if to_regclass('public.bookings') is not null then
    create or replace function public.prevent_booking_overlap()
    returns trigger
    language plpgsql
    as $fn$
    begin
      if (
        new.status is null
        or lower(new.status) not in ('cancelled', 'annulleret')
      ) then
        if exists (
          select 1
          from public.bookings b
          where b.id is distinct from new.id
            and (
              b.status is null
              or lower(b.status) not in ('cancelled', 'annulleret')
            )
            and b.slot_start < new.slot_end
            and b.slot_end > new.slot_start
        ) then
          raise exception 'Valgt tidsrum overlapper med en eksisterende booking.';
        end if;
      end if;

      return new;
    end;
    $fn$;

    drop trigger if exists trg_prevent_booking_overlap on public.bookings;
    create trigger trg_prevent_booking_overlap
    before insert or update on public.bookings
    for each row
    execute function public.prevent_booking_overlap();
  end if;
end $$;

notify pgrst, 'reload schema';
