-- ==============================================
-- Migration: 0.9.0 - team_event_and_writeups
-- Description: Add team event options, roster locking, viewer mode support, and write-ups
-- ==============================================

-- 1) Alter events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_team_event BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS writeup_deadline TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2) Create event_teams table
CREATE TABLE IF NOT EXISTS public.event_teams (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  registration_token VARCHAR(64) DEFAULT NULL,
  requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  PRIMARY KEY (event_id, team_id)
);

-- Enable RLS for event_teams
ALTER TABLE public.event_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Event teams admin all" ON public.event_teams;
CREATE POLICY "Event teams admin all"
  ON public.event_teams
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Event teams self select" ON public.event_teams;
CREATE POLICY "Event teams self select"
  ON public.event_teams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = event_teams.team_id
        AND tm.user_id = auth.uid()::uuid
    )
  );

GRANT SELECT ON public.event_teams TO authenticated;

-- 3) Create event_team_participants table (Roster Locking)
CREATE TABLE IF NOT EXISTS public.event_team_participants (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (event_id, team_id, user_id)
);

-- Enable RLS for event_team_participants
ALTER TABLE public.event_team_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Event team participants admin all" ON public.event_team_participants;
CREATE POLICY "Event team participants admin all"
  ON public.event_team_participants
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Event team participants self select" ON public.event_team_participants;
CREATE POLICY "Event team participants self select"
  ON public.event_team_participants
  FOR SELECT
  USING (user_id = auth.uid()::uuid);

GRANT SELECT ON public.event_team_participants TO authenticated;

-- 4) Create event_writeups table
CREATE TABLE IF NOT EXISTS public.event_writeups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_url VARCHAR(2048) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
  score_adjustment INTEGER DEFAULT 0,
  admin_notes TEXT DEFAULT '',
  UNIQUE (event_id, team_id)
);

-- Enable RLS for event_writeups
ALTER TABLE public.event_writeups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Event writeups admin all" ON public.event_writeups;
CREATE POLICY "Event writeups admin all"
  ON public.event_writeups
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Event writeups self select" ON public.event_writeups;
CREATE POLICY "Event writeups self select"
  ON public.event_writeups
  FOR SELECT
  USING (
    user_id = auth.uid()::uuid
    OR (
      team_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = event_writeups.team_id
          AND tm.user_id = auth.uid()::uuid
      )
    )
  );

GRANT SELECT ON public.event_writeups TO authenticated;
