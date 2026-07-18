-- ==============================================
-- Queries: flag_submissions
-- Source: sql/chema.sql
-- ==============================================

-- RLS/POLICY
ALTER TABLE public.flag_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Flag submissions select global admin" ON public.flag_submissions;
CREATE POLICY "Flag submissions select global admin"
  ON public.flag_submissions
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Flag submissions select self" ON public.flag_submissions;
CREATE POLICY "Flag submissions select self"
  ON public.flag_submissions
  FOR SELECT
  USING (auth.uid()::uuid = user_id);

-- ==============================================
-- Function: get_flag_submission_stats
-- ==============================================

CREATE OR REPLACE FUNCTION public.get_flag_submission_stats(
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_status TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  challenge_id UUID,
  challenge_title TEXT,
  challenge_category TEXT,
  incorrect_attempts INT,
  is_solved BOOLEAN,
  last_attempt_at TIMESTAMPTZ,
  solved_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only global admin can view flag submission stats';
  END IF;

  RETURN QUERY
  WITH enriched AS (
    SELECT
      fs.user_id,
      u.username::TEXT AS username,
      fs.challenge_id,
      c.title::TEXT AS challenge_title,
      c.category::TEXT AS challenge_category,
      fs.incorrect_attempts,
      (sv.id IS NOT NULL) AS is_solved,
      fs.last_attempt_at,
      sv.created_at AS solved_at
    FROM public.flag_submissions fs
    JOIN public.users u ON u.id = fs.user_id
    JOIN public.challenges c ON c.id = fs.challenge_id
    LEFT JOIN public.solves sv ON sv.user_id = fs.user_id AND sv.challenge_id = fs.challenge_id
    WHERE
      (p_status IS NULL OR p_status = 'all'
        OR (p_status = 'solved' AND sv.id IS NOT NULL)
        OR (p_status = 'incorrect' AND sv.id IS NULL)
      )
      AND (
        p_search IS NULL OR btrim(p_search) = ''
        OR u.username ILIKE '%' || btrim(p_search) || '%'
        OR c.title ILIKE '%' || btrim(p_search) || '%'
      )
  ),
  counted AS (
    SELECT COUNT(*)::BIGINT AS total_count FROM enriched
  )
  SELECT
    e.user_id,
    e.username,
    e.challenge_id,
    e.challenge_title,
    e.challenge_category,
    e.incorrect_attempts,
    e.is_solved,
    e.last_attempt_at,
    e.solved_at,
    ct.total_count
  FROM enriched e
  CROSS JOIN counted ct
  ORDER BY e.last_attempt_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 500)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_flag_submission_stats(INT, INT, TEXT, TEXT) TO authenticated;

-- ==============================================
-- Function: get_my_submission_status
-- ==============================================

CREATE OR REPLACE FUNCTION public.get_my_submission_status(
  p_challenge_id uuid
)
RETURNS TABLE (
  incorrect_attempts INT,
  window_attempts INT,
  window_start_at TIMESTAMPTZ,
  remaining_attempts INT,
  cooldown_seconds INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid := auth.uid()::uuid;
  v_incorrect_attempts INT := 0;
  v_window_attempts INT := 0;
  v_window_start TIMESTAMPTZ := now();
  v_remaining_attempts INT := 10;
  v_cooldown_seconds INT := 0;
  v_seconds_elapsed INT;
BEGIN
  SELECT 
    fs.incorrect_attempts, 
    fs.window_attempts, 
    fs.window_start_at
  INTO 
    v_incorrect_attempts, 
    v_window_attempts, 
    v_window_start
  FROM public.flag_submissions fs
  WHERE fs.user_id = v_user_id AND fs.challenge_id = p_challenge_id;

  IF FOUND THEN
    v_seconds_elapsed := EXTRACT(EPOCH FROM (now() - v_window_start))::INT;
    IF v_seconds_elapsed >= 60 THEN
      v_remaining_attempts := 10;
      v_cooldown_seconds := 0;
    ELSE
      v_remaining_attempts := GREATEST(0, 10 - v_window_attempts);
      IF v_window_attempts >= 10 THEN
        v_cooldown_seconds := GREATEST(0, 60 - v_seconds_elapsed);
      ELSE
        v_cooldown_seconds := 0;
      END IF;
    END IF;
  ELSE
    v_incorrect_attempts := 0;
    v_window_attempts := 0;
    v_window_start := now();
    v_remaining_attempts := 10;
    v_cooldown_seconds := 0;
  END IF;

  RETURN QUERY 
  SELECT 
    v_incorrect_attempts, 
    v_window_attempts, 
    v_window_start, 
    v_remaining_attempts, 
    v_cooldown_seconds;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_submission_status(uuid) TO authenticated;

