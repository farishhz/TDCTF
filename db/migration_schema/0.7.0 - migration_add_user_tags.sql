-- ==============================================
-- Migration: Add tags to users
-- Version: 0.7.0
-- ==============================================

-- 1) Add tags column to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL;

-- Create index for array containment queries (fast tag lookups)
CREATE INDEX IF NOT EXISTS users_tags_idx ON public.users USING gin (tags);
