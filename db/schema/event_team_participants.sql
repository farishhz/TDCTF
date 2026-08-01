-- ==============================================
-- Table: event_team_participants
-- ==============================================

CREATE TABLE IF NOT EXISTS public.event_team_participants (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (event_id, team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_team_participants ENABLE ROW LEVEL SECURITY;

-- Policies
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
