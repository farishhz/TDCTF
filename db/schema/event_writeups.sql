-- ==============================================
-- Table: event_writeups
-- ==============================================

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

-- Enable RLS
ALTER TABLE public.event_writeups ENABLE ROW LEVEL SECURITY;

-- Policies
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
