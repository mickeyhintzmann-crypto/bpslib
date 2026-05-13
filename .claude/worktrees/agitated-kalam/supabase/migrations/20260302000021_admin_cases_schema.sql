-- Admin-driven cases schema for /admin case management

-- A) Enum/constraints guardrails
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'case_category'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.case_category AS ENUM (
      'bordplade',
      'gulvafslibning',
      'gulvbelaegning'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'image_kind'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.image_kind AS ENUM (
      'before',
      'after',
      'wide',
      'detail'
    );
  END IF;
END $$;

-- B) Tables
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE IF EXISTS public.admin_users
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'admin_users'
      AND column_name = 'email'
  ) THEN
    ALTER TABLE public.admin_users
      ALTER COLUMN email DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'admin_users'
      AND column_name = 'name'
  ) THEN
    ALTER TABLE public.admin_users
      ALTER COLUMN name DROP NOT NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_idx
  ON public.admin_users(user_id)
  WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  logo_url text,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  summary text,
  location text,
  tags text[] NOT NULL DEFAULT '{}',
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  is_featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS public.cases
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

UPDATE public.cases
SET slug = COALESCE(NULLIF(slug, ''), CONCAT('case-', substring(id::text FROM 1 FOR 8)))
WHERE slug IS NULL OR btrim(slug) = '';

ALTER TABLE IF EXISTS public.cases
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE IF EXISTS public.cases
  DROP CONSTRAINT IF EXISTS cases_category_check;

ALTER TABLE IF EXISTS public.cases
  ADD CONSTRAINT cases_category_check
  CHECK (category IN ('bordplade', 'gulvafslibning', 'gulvbelaegning')) NOT VALID;

CREATE TABLE IF NOT EXISTS public.case_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  kind text NOT NULL,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS public.case_images
  DROP CONSTRAINT IF EXISTS case_images_kind_check;

ALTER TABLE IF EXISTS public.case_images
  ADD CONSTRAINT case_images_kind_check
  CHECK (kind IN ('before', 'after', 'wide', 'detail')) NOT VALID;

-- C) Indexes
CREATE UNIQUE INDEX IF NOT EXISTS clients_slug_idx ON public.clients(slug);
CREATE INDEX IF NOT EXISTS cases_category_idx ON public.cases(category);
CREATE INDEX IF NOT EXISTS cases_is_featured_idx ON public.cases(is_featured);
CREATE INDEX IF NOT EXISTS cases_published_idx ON public.cases(published);
CREATE UNIQUE INDEX IF NOT EXISTS cases_slug_idx ON public.cases(slug);
CREATE INDEX IF NOT EXISTS case_images_case_id_sort_order_idx
  ON public.case_images(case_id, sort_order);

-- Helper for admin-write policies
CREATE OR REPLACE FUNCTION public.is_admin_user(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = uid
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;

-- D) RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_images ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('admin_users', 'clients', 'cases', 'case_images')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- Public read
CREATE POLICY clients_public_read
  ON public.clients
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY cases_public_read
  ON public.cases
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY case_images_public_read
  ON public.case_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.cases c
      WHERE c.id = case_images.case_id
        AND c.published = true
    )
  );

CREATE POLICY admin_users_self_or_admin_read
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_user(auth.uid()));

-- Admin write
CREATE POLICY admin_users_admin_write
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY clients_admin_write
  ON public.clients
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY cases_admin_write
  ON public.cases
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY case_images_admin_write
  ON public.case_images
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

GRANT SELECT ON TABLE public.clients TO anon, authenticated;
GRANT SELECT ON TABLE public.cases TO anon, authenticated;
GRANT SELECT ON TABLE public.case_images TO anon, authenticated;
GRANT SELECT ON TABLE public.admin_users TO authenticated;

GRANT INSERT, UPDATE, DELETE ON TABLE public.admin_users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.clients TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.cases TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.case_images TO authenticated;

NOTIFY pgrst, 'reload schema';
