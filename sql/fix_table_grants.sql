-- ============================================================
-- Run this in YOUR Supabase SQL Editor
-- Fixes "permission denied for table programs" (and other CMS tables)
-- Safe to run multiple times (idempotent)
-- ============================================================

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'programs','live_streams','matches','competitions',
    'news','videos','ticker_headlines','site_settings',
    'profiles','user_roles'
  ]
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY[
    'programs','live_streams','matches','competitions',
    'news','videos','ticker_headlines','site_settings'
  ]
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
  END LOOP;
END$$;

-- Ensure admin write policy + public read policy exist on programs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='programs' AND policyname='Admins manage programs') THEN
    CREATE POLICY "Admins manage programs" ON public.programs
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='programs' AND policyname='Public read programs') THEN
    CREATE POLICY "Public read programs" ON public.programs
      FOR SELECT TO anon, authenticated USING (true);
  END IF;
END$$;
