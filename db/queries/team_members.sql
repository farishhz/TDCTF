-- ==============================================
-- Queries: team_members
-- Source: sql/teams.sql
-- ==============================================

-- SELECT
DROP FUNCTION IF EXISTS get_my_team(uuid, text);
CREATE OR REPLACE FUNCTION get_my_team(
  p_event_id uuid DEFAULT NULL,
  p_event_mode text DEFAULT 'any'
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
  v_team JSON;
  v_members JSON;
  v_solved_event_ids UUID[];
  v_has_main_solved BOOLEAN := FALSE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT team_id INTO v_team_id
  FROM public.team_members
  WHERE user_id = v_user_id;

  IF v_team_id IS NULL THEN
    RETURN json_build_object('success', true, 'team', NULL, 'members', '[]'::json);
  END IF;

  SELECT json_build_object(
    'id', t.id,
    'name', t.name,
    'invite_code', t.invite_code,
    'picture_url', t.picture_url,
    'created_at', t.created_at
  )
  INTO v_team
  FROM public.teams t
  WHERE t.id = v_team_id;

  v_members := public.get_team_members_with_stats(v_team_id, p_event_id, p_event_mode);

  SELECT COALESCE(
    array_agg(DISTINCT c.event_id) FILTER (WHERE c.event_id IS NOT NULL),
    '{}'::uuid[]
  ),
  COALESCE(bool_or(c.event_id IS NULL), FALSE)
  INTO v_solved_event_ids, v_has_main_solved
  FROM public.solves s
  JOIN public.challenges c ON c.id = s.challenge_id
  JOIN public.team_members tm ON tm.user_id = s.user_id
  WHERE tm.team_id = v_team_id;

  RETURN json_build_object(
    'success', true,
    'team', v_team,
    'members', v_members,
    'solved_event_ids', v_solved_event_ids,
    'has_main_solved', v_has_main_solved
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION get_my_team(uuid, text) TO authenticated;

DROP FUNCTION IF EXISTS get_my_team_summary(uuid, text);
CREATE OR REPLACE FUNCTION get_my_team_summary(
  p_event_id uuid DEFAULT NULL,
  p_event_mode text DEFAULT 'any'
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
  v_team JSON;
  v_stats JSON;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT team_id INTO v_team_id
  FROM public.team_members
  WHERE user_id = v_user_id;

  IF v_team_id IS NULL THEN
    RETURN json_build_object('success', true, 'team', NULL, 'stats', json_build_object(
      'unique_score', 0,
      'total_score', 0,
      'unique_challenges', 0,
      'total_solves', 0
    ));
  END IF;

  SELECT json_build_object(
    'id', t.id,
    'name', t.name,
    'invite_code', t.invite_code,
    'picture_url', t.picture_url,
    'created_at', t.created_at
  )
  INTO v_team
  FROM public.teams t
  WHERE t.id = v_team_id;

  v_stats := public.get_team_summary_stats(v_team_id, p_event_id, p_event_mode);

  RETURN json_build_object('success', true, 'team', v_team, 'stats', v_stats);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION get_my_team_summary(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_team_challenges_by_id(
  p_team_id UUID,
  p_event_id UUID DEFAULT NULL,
  p_event_mode TEXT DEFAULT 'any'
)
RETURNS TABLE (
  challenge_id UUID,
  title TEXT,
  category TEXT,
  points INTEGER,
  first_solved_at TIMESTAMPTZ,
  first_solver_username TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS challenge_id,
    c.title::TEXT,
    c.category::TEXT,
    c.points,
    MIN(s.created_at) AS first_solved_at,
    (
      SELECT u.username::TEXT
      FROM public.solves s2
      JOIN public.team_members tm2 ON tm2.user_id = s2.user_id
      JOIN public.users u ON u.id = s2.user_id
      JOIN public.challenges c2 ON c2.id = s2.challenge_id
      WHERE tm2.team_id = p_team_id AND s2.challenge_id = c.id
      AND public.match_event_mode(p_event_mode, p_event_id, c2.event_id)
      ORDER BY s2.created_at ASC, s2.id ASC
      LIMIT 1
    ) AS first_solver_username
  FROM public.solves s
  JOIN public.team_members tm ON tm.user_id = s.user_id
  JOIN public.challenges c ON c.id = s.challenge_id
  WHERE tm.team_id = p_team_id
  AND public.match_event_mode(p_event_mode, p_event_id, c.event_id)
  GROUP BY c.id, c.title, c.category, c.points
  ORDER BY first_solved_at DESC;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION public.get_team_challenges_by_id(UUID, UUID, TEXT) TO authenticated;

DROP FUNCTION IF EXISTS get_my_team_challenges(uuid, text);
CREATE OR REPLACE FUNCTION get_my_team_challenges(
  p_event_id uuid DEFAULT NULL,
  p_event_mode text DEFAULT 'any'
)
RETURNS TABLE (
  challenge_id UUID,
  title TEXT,
  category TEXT,
  points INTEGER,
  first_solved_at TIMESTAMPTZ,
  first_solver_username TEXT
) AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT team_id INTO v_team_id
  FROM public.team_members
  WHERE user_id = v_user_id;

  IF v_team_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT * FROM public.get_team_challenges_by_id(v_team_id, p_event_id, p_event_mode);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION get_my_team_challenges(uuid, text) TO authenticated;

DROP FUNCTION IF EXISTS get_team_challenges_by_name(TEXT, uuid, text);
CREATE OR REPLACE FUNCTION get_team_challenges_by_name(
  p_name TEXT,
  p_event_id uuid DEFAULT NULL,
  p_event_mode text DEFAULT 'any'
)
RETURNS TABLE (
  challenge_id UUID,
  title TEXT,
  category TEXT,
  points INTEGER,
  first_solved_at TIMESTAMPTZ,
  first_solver_username TEXT
) AS $$
DECLARE
  v_team_id UUID;
BEGIN
  SELECT id INTO v_team_id
  FROM public.teams
  WHERE lower(name) = lower(p_name)
  LIMIT 1;

  IF v_team_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT * FROM public.get_team_challenges_by_id(v_team_id, p_event_id, p_event_mode);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION get_team_challenges_by_name(TEXT, uuid, text) TO authenticated;

-- INSERT
CREATE OR REPLACE FUNCTION join_team(p_invite_code TEXT)
RETURNS UUID AS $$
  DECLARE
    v_user_id UUID := auth.uid()::uuid;
    v_team_id UUID;
    v_count INT;
    v_max_members INT := 5;
  BEGIN
    IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF public.get_system_setting('disable_join_team') = 'true' AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Joining teams is currently disabled';
    END IF;

    IF EXISTS (SELECT 1 FROM public.team_members WHERE user_id = v_user_id) THEN
      RAISE EXCEPTION 'User already in a team';
    END IF;

    SELECT t.id INTO v_team_id
    FROM public.teams t
    WHERE t.invite_code = p_invite_code;

    IF v_team_id IS NULL THEN
      RAISE EXCEPTION 'Invalid invite code';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM public.team_members tm
    WHERE tm.team_id = v_team_id;

    SELECT COALESCE(NULLIF(public.get_system_setting('max_team_members'), ''), '5')::INTEGER INTO v_max_members;

    IF v_count >= v_max_members THEN
      RAISE EXCEPTION 'Team is full';
    END IF;

    INSERT INTO public.team_members(team_id, user_id)
    VALUES (v_team_id, v_user_id);

    RETURN v_team_id;
  END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION join_team(TEXT) TO authenticated;

-- UPDATE
CREATE OR REPLACE FUNCTION transfer_team_captain(p_team_id UUID, p_new_captain_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_requester UUID := auth.uid()::uuid;
  v_is_member BOOLEAN;
BEGIN
  IF v_requester IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT is_admin() AND NOT is_team_captain(p_team_id) THEN
    RAISE EXCEPTION 'Only captain or admin can transfer captain';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = p_new_captain_user_id
  ) INTO v_is_member;

  IF NOT v_is_member THEN
    RAISE EXCEPTION 'New captain must be a team member';
  END IF;

  UPDATE public.teams
  SET captain_user_id = p_new_captain_user_id,
      updated_at = now()
  WHERE id = p_team_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION transfer_team_captain(UUID, UUID) TO authenticated;

-- DELETE
CREATE OR REPLACE FUNCTION leave_team()
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
  v_captain_id UUID;
  v_count INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF public.get_system_setting('disable_join_team') = 'true' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Leaving teams is currently disabled';
  END IF;

  SELECT team_id INTO v_team_id
  FROM public.team_members
  WHERE user_id = v_user_id;

  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'User is not in a team';
  END IF;

  SELECT captain_user_id INTO v_captain_id
  FROM public.teams
  WHERE id = v_team_id;

  SELECT COUNT(*) INTO v_count
  FROM public.team_members
  WHERE team_id = v_team_id;

  IF v_captain_id = v_user_id AND v_count > 1 THEN
    RAISE EXCEPTION 'Captain must transfer captaincy or delete team first';
  END IF;

  IF v_captain_id = v_user_id AND v_count = 1 THEN
    DELETE FROM public.teams WHERE id = v_team_id;
    RETURN TRUE;
  END IF;

  DELETE FROM public.team_members
  WHERE team_id = v_team_id AND user_id = v_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION leave_team() TO authenticated;

CREATE OR REPLACE FUNCTION kick_team_member(p_team_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_requester UUID := auth.uid()::uuid;
  v_is_member BOOLEAN;
  v_is_captain BOOLEAN;
BEGIN
  IF v_requester IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF get_system_setting('disable_join_team') = 'true' AND NOT is_admin() THEN
    RAISE EXCEPTION 'Team membership changes are currently disabled';
  END IF;

  IF v_requester = p_user_id THEN
    RAISE EXCEPTION 'Cannot kick yourself';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = p_user_id
  ) INTO v_is_member;

  IF NOT v_is_member THEN
    RAISE EXCEPTION 'User not in team';
  END IF;

  v_is_captain := is_team_captain(p_team_id);

  IF NOT is_admin() AND NOT v_is_captain THEN
    RAISE EXCEPTION 'Only captain or admin can kick members';
  END IF;

  DELETE FROM public.team_members
  WHERE team_id = p_team_id AND user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION kick_team_member(UUID, UUID) TO authenticated;

-- RLS/POLICY
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members admin only" ON public.team_members;
CREATE POLICY "Team members admin only"
  ON public.team_members
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
