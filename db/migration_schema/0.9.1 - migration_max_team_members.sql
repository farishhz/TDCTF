-- ==============================================
-- Migration: 0.9.1 - max_team_members_and_tokens
-- Description: Add max_team_members limit to events, enforce checking on join/approve, and implement unique team tokens
-- ==============================================

-- 1) Add max_team_members to public.events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS max_team_members INTEGER DEFAULT NULL;

-- 2) Update list_event_teams to include registration_token
DROP FUNCTION IF EXISTS public.list_event_teams(UUID);

CREATE OR REPLACE FUNCTION public.list_event_teams(p_event_id UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  picture_url TEXT,
  status TEXT,
  requested_at TIMESTAMPTZ,
  requested_by_username TEXT,
  reviewed_at TIMESTAMPTZ,
  member_count BIGINT,
  registration_token TEXT
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    et.team_id,
    t.name::TEXT AS team_name,
    t.picture_url::TEXT,
    et.status::TEXT,
    et.requested_at,
    u.username::TEXT AS requested_by_username,
    et.reviewed_at,
    (SELECT COUNT(*) FROM public.team_members tm WHERE tm.team_id = et.team_id) AS member_count,
    et.registration_token::TEXT
  FROM public.event_teams et
  JOIN public.teams t ON t.id = et.team_id
  LEFT JOIN public.users u ON u.id = et.requested_by
  WHERE et.event_id = p_event_id
  ORDER BY et.requested_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION public.list_event_teams(UUID) TO authenticated;

-- 3) Admin generate unique team token
CREATE OR REPLACE FUNCTION public.admin_generate_team_token(
  p_event_id UUID,
  p_team_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_admin_id UUID := auth.uid()::uuid;
  v_token TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Generate random token: CTF-TEAM-XXXX-XXXX
  v_token := 'CTF-TEAM-' || UPPER(substring(md5(random()::text) from 1 for 6)) || '-' || UPPER(substring(md5(random()::text) from 7 for 6));

  -- Insert or update if row already exists
  INSERT INTO public.event_teams (event_id, team_id, status, registration_token, requested_by, requested_at, reviewed_by, reviewed_at)
  VALUES (p_event_id, p_team_id, 'pending', v_token, v_admin_id, now(), v_admin_id, now())
  ON CONFLICT (event_id, team_id) 
  DO UPDATE SET registration_token = v_token, status = 'pending';

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION public.admin_generate_team_token(UUID, UUID) TO authenticated;

-- 4) List unregistered teams for token allocation
CREATE OR REPLACE FUNCTION public.list_unregistered_teams(p_event_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  captain_username TEXT
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    t.id,
    t.name::TEXT,
    u.username::TEXT AS captain_username
  FROM public.teams t
  LEFT JOIN public.users u ON u.id = t.captain_user_id
  WHERE t.id NOT IN (
    SELECT team_id FROM public.event_teams WHERE event_id = p_event_id
  )
  ORDER BY t.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION public.list_unregistered_teams(UUID) TO authenticated;

-- 5) Update join_team_event to support unique team token validation and max_team_members verification
CREATE OR REPLACE FUNCTION public.join_team_event(
  p_event_id UUID,
  p_registration_token TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
  v_is_captain BOOLEAN;
  v_is_team_event BOOLEAN;
  v_join_mode TEXT;
  v_max_members INTEGER;
  v_current_members INTEGER;
  v_token_match BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user's team
  SELECT team_id INTO v_team_id
  FROM public.team_members
  WHERE user_id = v_user_id;

  IF v_team_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Anda harus bergabung atau membuat Tim terlebih dahulu.');
  END IF;

  -- Check if user is captain
  SELECT EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = v_team_id AND captain_user_id = v_user_id
  ) INTO v_is_captain;

  IF NOT v_is_captain THEN
    RETURN json_build_object('success', false, 'message', 'Hanya Kapten Tim yang dapat mendaftarkan tim ke event.');
  END IF;

  -- Get event details
  SELECT is_team_event, join_mode, max_team_members
  INTO v_is_team_event, v_join_mode, v_max_members
  FROM public.events
  WHERE id = p_event_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Event tidak ditemukan.');
  END IF;

  IF NOT v_is_team_event THEN
    RETURN json_build_object('success', false, 'message', 'Event ini bukan event bertipe Tim.');
  END IF;

  -- Get current member count of this team
  SELECT COUNT(*) INTO v_current_members
  FROM public.team_members
  WHERE team_id = v_team_id;

  -- Verify team size limit
  IF v_max_members IS NOT NULL AND v_current_members > v_max_members THEN
    RETURN json_build_object('success', false, 'message', 'Jumlah anggota tim Anda (' || v_current_members || ') melebihi batas maksimal event (' || v_max_members || ' anggota).');
  END IF;

  -- Verify token if join_mode is 'key'
  IF v_join_mode = 'key' THEN
    IF p_registration_token IS NULL OR trim(p_registration_token) = '' THEN
      RETURN json_build_object('success', false, 'message', 'Token registrasi tim diperlukan.');
    END IF;

    -- Match against pre-generated token for this team in event_teams
    SELECT (registration_token = p_registration_token) INTO v_token_match
    FROM public.event_teams
    WHERE event_id = p_event_id AND team_id = v_team_id;

    IF v_token_match IS NULL OR NOT v_token_match THEN
      RETURN json_build_object('success', false, 'message', 'Token registrasi tim tidak valid. Silakan hubungi Admin untuk mendapatkan token tim Anda.');
    END IF;

    -- Auto-approve because token is verified
    UPDATE public.event_teams
    SET status = 'approved',
        requested_by = v_user_id,
        requested_at = now(),
        reviewed_at = now()
    WHERE event_id = p_event_id AND team_id = v_team_id;

    -- Snap roster
    DELETE FROM public.event_team_participants
    WHERE event_id = p_event_id AND team_id = v_team_id;

    INSERT INTO public.event_team_participants (event_id, team_id, user_id, joined_at)
    SELECT p_event_id, v_team_id, tm.user_id, now()
    FROM public.team_members tm
    WHERE tm.team_id = v_team_id;

    RETURN json_build_object('success', true, 'message', 'Pendaftaran tim disetujui (Roster Terkunci!).');
  END IF;

  -- Handle 'open' join_mode
  IF v_join_mode = 'open' THEN
    -- Check if already exists
    IF EXISTS (SELECT 1 FROM public.event_teams WHERE event_id = p_event_id AND team_id = v_team_id) THEN
      RETURN json_build_object('success', false, 'message', 'Tim Anda sudah terdaftar untuk event ini.');
    END IF;

    INSERT INTO public.event_teams (event_id, team_id, status, requested_by, requested_at, reviewed_at)
    VALUES (p_event_id, v_team_id, 'approved', v_user_id, now(), now());

    DELETE FROM public.event_team_participants
    WHERE event_id = p_event_id AND team_id = v_team_id;

    INSERT INTO public.event_team_participants (event_id, team_id, user_id, joined_at)
    SELECT p_event_id, v_team_id, tm.user_id, now()
    FROM public.team_members tm
    WHERE tm.team_id = v_team_id;

    RETURN json_build_object('success', true, 'message', 'Pendaftaran tim disetujui (Roster Terkunci!).');
  END IF;

  -- Handle 'request' join_mode
  IF v_join_mode = 'request' THEN
    -- Check if already exists
    IF EXISTS (SELECT 1 FROM public.event_teams WHERE event_id = p_event_id AND team_id = v_team_id) THEN
      RETURN json_build_object('success', false, 'message', 'Tim Anda sudah terdaftar untuk event ini.');
    END IF;

    INSERT INTO public.event_teams (event_id, team_id, status, requested_by, requested_at)
    VALUES (p_event_id, v_team_id, 'pending', v_user_id, now());

    RETURN json_build_object('success', true, 'message', 'Pendaftaran tim berhasil diajukan. Menunggu persetujuan Admin.');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION public.join_team_event(UUID, TEXT) TO authenticated;

-- 6) Update review_team_event to verify max_team_members
CREATE OR REPLACE FUNCTION public.review_team_event(
  p_event_id UUID,
  p_team_id UUID,
  p_approve BOOLEAN
)
RETURNS JSON AS $$
DECLARE
  v_admin_id UUID := auth.uid()::uuid;
  v_before_status VARCHAR(16);
  v_max_members INTEGER;
  v_current_members INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can review team event registrations';
  END IF;

  SELECT status INTO v_before_status
  FROM public.event_teams
  WHERE event_id = p_event_id AND team_id = p_team_id;

  IF v_before_status IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Pendaftaran tim tidak ditemukan.');
  END IF;

  IF p_approve THEN
    -- Get limit details
    SELECT max_team_members INTO v_max_members
    FROM public.events
    WHERE id = p_event_id;

    -- Get current count
    SELECT COUNT(*) INTO v_current_members
    FROM public.team_members
    WHERE team_id = p_team_id;

    IF v_max_members IS NOT NULL AND v_current_members > v_max_members THEN
      RETURN json_build_object('success', false, 'message', 'Gagal menyetujui: Anggota tim (' || v_current_members || ') melebihi batas maksimal event (' || v_max_members || ' anggota).');
    END IF;

    UPDATE public.event_teams
    SET status = 'approved',
        reviewed_by = v_admin_id,
        reviewed_at = now()
    WHERE event_id = p_event_id AND team_id = p_team_id;

    DELETE FROM public.event_team_participants
    WHERE event_id = p_event_id AND team_id = p_team_id;

    INSERT INTO public.event_team_participants (event_id, team_id, user_id, joined_at)
    SELECT p_event_id, p_team_id, tm.user_id, now()
    FROM public.team_members tm
    WHERE tm.team_id = p_team_id;

    RETURN json_build_object('success', true, 'status', 'approved');
  ELSE
    UPDATE public.event_teams
    SET status = 'rejected',
        reviewed_by = v_admin_id,
        reviewed_at = now()
    WHERE event_id = p_event_id AND team_id = p_team_id;

    DELETE FROM public.event_team_participants
    WHERE event_id = p_event_id AND team_id = p_team_id;

    RETURN json_build_object('success', true, 'status', 'rejected');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION public.review_team_event(UUID, UUID, BOOLEAN) TO authenticated;
