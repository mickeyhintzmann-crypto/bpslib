# Datamodel (MVP)

## bookings
Formål: slot-baseret booking for massiv træ.
- `id` (uuid, pk)
- `customer_name`
- `customer_email`
- `customer_phone`
- `service_type` (enum: `bordplade`)
- `slot_start` (timestamp)
- `slot_end` (timestamp)
- `status` (enum: `pending`, `confirmed`, `cancelled`)
- `notes`
- `source` (f.eks. `estimator`)
- `estimator_request_id` (uuid, nullable fk -> estimator_requests.id)
- `created_at`

## day_overrides
Formål: åbne/lukke tider og blokke.
- `id` (uuid, pk)
- `date` (date)
- `is_open` (bool)
- `open_from` (time, nullable)
- `open_to` (time, nullable)
- `reason`
- `created_at`

## leads
Formål: lead-gen fra `/tilbudstid`.
- `id` (uuid, pk)
- `name`
- `email`
- `phone`
- `service_category` (f.eks. `gulv`, `trappe`, `andet`)
- `message`
- `created_at`
- `status` (enum: `new`, `contacted`, `closed`)

## estimator_requests
Formål: prisberegner med manuel vurdering.
- `id` (uuid, pk)
- `created_at` (timestamp)
- `gating_answer` (`ja`, `nej`, `ved_ikke`)
- `fields` (jsonb: navn, telefon, email, postnr, mål, skader m.m.)
- `images` (jsonb array med storage paths + metadata)
- `status` (`Ny`, `Under review`, `Tilbud sendt`, `Booket`, `Lukket`)
- `retention_delete_at` (timestamp)
- `internal_note` (text, intern admin note)
- `price_min` (integer, valgfri)
- `price_max` (integer, valgfri)
- `slot_count` (integer, valgfri)
- `booking_id` (uuid, nullable fk -> bookings.id)

## users
Formål: interne brugere.
- `id` (uuid, pk)
- `email`
- `name`
- `created_at`

## roles
Formål: rollebaseret adgang.
- `id` (uuid, pk)
- `name` (f.eks. `admin`, `editor`)

## user_roles
Formål: mange-til-mange mellem users og roles.
- `user_id` (fk -> users.id)
- `role_id` (fk -> roles.id)

## audit_log
Formål: sporbarhed for ændringer.
- `id` (uuid, pk)
- `actor_user_id` (fk -> users.id)
- `action` (string)
- `entity_type` (string)
- `entity_id` (uuid)
- `metadata` (jsonb)
- `created_at`
