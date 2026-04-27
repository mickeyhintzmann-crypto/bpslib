-- Tilføj 'rep' som tilladt service-type i jobs-tabellen
-- Rep-opgaver er korte vedligeholdelsesjob (let slib og olie) der IKKE optager et booking-slot.

alter table if exists public.jobs
  drop constraint if exists jobs_service_check;

alter table if exists public.jobs
  add constraint jobs_service_check
  check (
    service is null
    or service in (
      'bordplade', 'gulvafslibning', 'gulvbelaegning', 'microcement',
      'maler', 'toemrer', 'murer', 'andet', 'rep'
    )
  );
