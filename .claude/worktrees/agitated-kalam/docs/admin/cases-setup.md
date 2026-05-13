# Cases Setup (Supabase)

Denne guide sætter cases op til admin-drevet oprettelse/redigering med RLS.

## 1) Opret storage buckets

I Supabase Dashboard -> `Storage` -> `New bucket`:

1. `case-images` (Public bucket)
2. `client-logos` (Public bucket)

## 2) Anbefalet mappestruktur i buckets

### `case-images`

- `bordplade/<case-slug>/before-01.jpg`
- `bordplade/<case-slug>/after-01.jpg`
- `gulvafslibning/<case-slug>/before-01.jpg`
- `gulvafslibning/<case-slug>/after-01.jpg`
- `gulvbelaegning/<case-slug>/wide-01.jpg`

### `client-logos`

- `clients/<client-slug>.svg`

## 3) Kør migrationen

Repo bruger SQL-migrationer i `supabase/migrations/`.

Ny migration for cases/admin:

- `supabase/migrations/20260302000021_admin_cases_schema.sql`

Kør enten:

1. Via jeres normale Supabase migration-flow (CLI/CI), eller
2. Kopiér SQL-indholdet ind i Supabase SQL Editor og kør det manuelt.

## 4) Giv din admin-bruger write-adgang

1. Gå til `Auth -> Users`
2. Kopiér din bruger `id` (UUID)
3. Kør i SQL Editor:

```sql
insert into admin_users (user_id) values ('<uuid>');
```

## 5) RLS-regler (hvad migrationen gør)

- Public read:
  - `clients` (SELECT)
  - `cases` hvor `published = true`
  - `case_images` for cases der er `published = true`
- Admin write (INSERT/UPDATE/DELETE):
  - `clients`, `cases`, `case_images`, `admin_users`
  - kun for authenticated users, der findes i `admin_users.user_id`

## 6) Felter i schemaet

- `clients`: `slug`, `name`, `logo_url`, `is_featured`
- `cases`: `category`, `title`, `slug`, `summary`, `location`, `tags`, `client_id`, `is_featured`, `published`
- `case_images`: `case_id`, `kind` (`before|after|wide|detail`), `url`, `sort_order`
