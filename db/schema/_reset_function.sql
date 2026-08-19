-- ==============================================
-- Global Reset Helpers
-- ==============================================

-- Drop all policies in public schema
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, schemaname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I CASCADE;',
      r.policyname, r.schemaname, r.tablename
    );
  END LOOP;
END $$;

-- Drop all functions in public schema (EXCLUDING extension functions)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS funcsig
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
    WHERE n.nspname = 'public'
      AND d.objid IS NULL
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE;', r.funcsig);
  END LOOP;
END $$;

-- Drop all views in public schema
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
  LOOP
    EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE;', r.table_name);
  END LOOP;
END $$;

-- Drop all triggers in public schema (EXCLUDING extension triggers)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tgname, relname
    FROM pg_trigger
    JOIN pg_class c ON pg_trigger.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    LEFT JOIN pg_depend d ON d.objid = pg_trigger.oid AND d.deptype = 'e'
    WHERE n.nspname = 'public' AND NOT tgisinternal
      AND d.objid IS NULL
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I CASCADE;', r.tgname, r.relname);
  END LOOP;
END $$;

-- Ensure schema permissions are granted to all standard roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
