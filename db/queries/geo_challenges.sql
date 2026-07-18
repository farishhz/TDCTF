-- ==============================================
-- Queries: geo_challenges
-- GeoGuessr-style challenge support
-- Flag format: prefix{geo:lat,lng,radius_km}
-- Example:   nxctf{geo:-6.2000,106.8160,1.500}
-- ==============================================

-- -----------------------------------------------
-- Helper: haversine_distance
-- Returns distance in kilometers between two lat/lng points
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.haversine_distance(
  p_lat1 DOUBLE PRECISION,
  p_lng1 DOUBLE PRECISION,
  p_lat2 DOUBLE PRECISION,
  p_lng2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    6371.0 * acos(
      LEAST(1.0,
        cos(radians(p_lat1)) * cos(radians(p_lat2))
        * cos(radians(p_lng2) - radians(p_lng1))
        + sin(radians(p_lat1)) * sin(radians(p_lat2))
      )
    )
$$;

GRANT EXECUTE ON FUNCTION public.haversine_distance(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated, anon;

-- -----------------------------------------------
-- Helper: parse_geo_flag
-- Parses a geo flag string into (prefix, target_lat, target_lng, radius_km)
-- Returns empty if the flag is not a valid geo flag
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.parse_geo_flag(p_flag TEXT)
RETURNS TABLE(prefix TEXT, target_lat DOUBLE PRECISION, target_lng DOUBLE PRECISION, radius_km DOUBLE PRECISION)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_inner TEXT;
  v_parts TEXT[];
BEGIN
  -- Must match pattern: anything{geo:lat,lng,radius}
  IF p_flag IS NULL OR p_flag !~ '^[^{]+\{geo:[-0-9.,]+\}$' THEN
    RETURN;
  END IF;

  prefix := substring(p_flag FROM '^([^{]+)');
  v_inner := substring(p_flag FROM '\{geo:(.+)\}$');

  IF v_inner IS NULL THEN
    RETURN;
  END IF;

  v_parts := string_to_array(v_inner, ',');

  IF array_length(v_parts, 1) != 3 THEN
    RETURN;
  END IF;

  BEGIN
    target_lat := trim(v_parts[1])::DOUBLE PRECISION;
    target_lng := trim(v_parts[2])::DOUBLE PRECISION;
    radius_km  := trim(v_parts[3])::DOUBLE PRECISION;

    -- Sanity check coordinates
    IF target_lat < -90 OR target_lat > 90 THEN RETURN; END IF;
    IF target_lng < -180 OR target_lng > 180 THEN RETURN; END IF;
    IF radius_km <= 0 THEN RETURN; END IF;

    RETURN NEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN;
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.parse_geo_flag(TEXT) TO authenticated, anon;

-- -----------------------------------------------
-- Helper: is_geo_flag
-- Returns true if the flag string is a valid geo flag format
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.is_geo_flag(p_flag TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.parse_geo_flag(p_flag));
$$;

GRANT EXECUTE ON FUNCTION public.is_geo_flag(TEXT) TO authenticated, anon;

-- -----------------------------------------------
-- Helper: parse_submitted_geo_flag
-- Parses a user's submitted geo guess flag format: prefix{geo:lat,lng}
-- Returns empty if format is invalid
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.parse_submitted_geo_flag(p_flag TEXT)
RETURNS TABLE(prefix TEXT, lat DOUBLE PRECISION, lng DOUBLE PRECISION)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_inner TEXT;
  v_parts TEXT[];
BEGIN
  -- Must match pattern: anything{geo:lat,lng}
  IF p_flag IS NULL OR p_flag !~ '^[^{]+\{geo:[-0-9.,]+\}$' THEN
    RETURN;
  END IF;

  prefix := substring(p_flag FROM '^([^{]+)');
  v_inner := substring(p_flag FROM '\{geo:(.+)\}$');

  IF v_inner IS NULL THEN
    RETURN;
  END IF;

  v_parts := string_to_array(v_inner, ',');

  IF array_length(v_parts, 1) != 2 THEN
    RETURN;
  END IF;

  BEGIN
    lat := trim(v_parts[1])::DOUBLE PRECISION;
    lng := trim(v_parts[2])::DOUBLE PRECISION;

    -- Sanity check coordinates
    IF lat < -90 OR lat > 90 THEN RETURN; END IF;
    IF lng < -180 OR lng > 180 THEN RETURN; END IF;

    RETURN NEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN;
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.parse_submitted_geo_flag(TEXT) TO authenticated, anon;

-- -----------------------------------------------
-- Function: get_challenges_with_geo_flag
-- Returns challenge_ids that have a geo-format flag, along with prefix
-- Used to populate has_geo_flag + geo_prefix in the challenge list
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.get_challenges_with_geo_flag(
  p_challenge_ids UUID[]
)
RETURNS TABLE (
  challenge_id UUID,
  geo_prefix TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (cf.challenge_id)
    cf.challenge_id,
    pgf.prefix AS geo_prefix
  FROM public.challenge_flags cf
  CROSS JOIN LATERAL public.parse_geo_flag(cf.flag) pgf
  WHERE cf.challenge_id = ANY(p_challenge_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_challenges_with_geo_flag(UUID[]) TO authenticated;

-- -----------------------------------------------
-- Function: get_geo_challenge_target
-- Returns target coordinates and radius if user is admin OR has solved the challenge
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.get_geo_challenge_target(
  p_challenge_id UUID
)
RETURNS TABLE (
  target_lat DOUBLE PRECISION,
  target_lng DOUBLE PRECISION,
  radius_km  DOUBLE PRECISION,
  flag       TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_is_admin BOOLEAN := FALSE;
  v_has_solved BOOLEAN := FALSE;
  v_flag TEXT;
BEGIN
  v_is_admin := public.is_admin() OR public.can_manage_challenge(p_challenge_id);
  
  SELECT EXISTS (
    SELECT 1 FROM public.solves
    WHERE user_id = v_user_id AND challenge_id = p_challenge_id
  ) INTO v_has_solved;

  IF NOT (v_is_admin OR v_has_solved) THEN
    RETURN;
  END IF;

  SELECT cf.flag INTO v_flag
  FROM public.challenge_flags cf
  WHERE cf.challenge_id = p_challenge_id;

  IF v_flag IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT pgf.target_lat, pgf.target_lng, pgf.radius_km, v_flag
  FROM public.parse_geo_flag(v_flag) pgf LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_geo_challenge_target(UUID) TO authenticated;
