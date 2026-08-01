-- ==============================================
-- Table: event_teams
-- ==============================================

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

-- Enable RLS
ALTER TABLE public.event_teams ENABLE ROW LEVEL SECURITY;

-- Policies
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
