-- ============================================================
-- Run this in YOUR Supabase SQL Editor
-- Bootstraps ssegwanyibillgates@gmail.com as absolute super admin
-- Safe to run multiple times (idempotent)
-- ============================================================

-- 1) Ensure app_role enum exists with 'admin'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END$$;

-- 2) Grant admin role to the super admin RIGHT NOW (if user already exists)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = lower('ssegwanyibillgates@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3) Trigger: auto-grant admin whenever this email signs up (Google or password)
CREATE OR REPLACE FUNCTION public.grant_super_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = lower('ssegwanyibillgates@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS grant_super_admin_on_signup_trg ON auth.users;
CREATE TRIGGER grant_super_admin_on_signup_trg
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_super_admin_on_signup();

-- 4) Verify (optional — run this on its own to confirm)
-- SELECT u.email, r.role
-- FROM auth.users u
-- JOIN public.user_roles r ON r.user_id = u.id
-- WHERE lower(u.email) = lower('ssegwanyibillgates@gmail.com');
