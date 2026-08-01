-- ==============================================
-- Queries: event_writeups
-- RPCs for Write-Up Submissions and Evaluations
-- ==============================================

-- 1) Peserta mengumpulkan Write-Up (Kapten atau anggota tim terdaftar)
CREATE OR REPLACE FUNCTION submit_event_writeup(
  p_event_id UUID,
  p_file_url TEXT,
  p_filename TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID := NULL;
  v_is_team_event BOOLEAN;
  v_writeup_deadline TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
  v_is_allowed BOOLEAN := FALSE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Dapatkan detail event
  SELECT is_team_event, writeup_deadline, end_time
  INTO v_is_team_event, v_writeup_deadline, v_end_time
  FROM public.events
  WHERE id = p_event_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Event tidak ditemukan.');
  END IF;

  -- Validasi Deadline Pengumpulan
  IF v_writeup_deadline IS NOT NULL AND now() > v_writeup_deadline THEN
    RETURN json_build_object('success', false, 'message', 'Batas waktu pengumpulan Write-Up telah berakhir.');
  END IF;

  -- Jika tipe tim, harus terdaftar dan disetujui dalam event_team_participants
  IF v_is_team_event THEN
    SELECT team_id INTO v_team_id
    FROM public.team_members
    WHERE user_id = v_user_id;

    IF v_team_id IS NULL THEN
      RETURN json_build_object('success', false, 'message', 'Hanya peserta dengan tim yang dapat mengumpulkan Write-Up.');
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM public.event_team_participants
      WHERE event_id = p_event_id AND team_id = v_team_id AND user_id = v_user_id
    ) INTO v_is_allowed;

    IF NOT v_is_allowed THEN
      RETURN json_build_object('success', false, 'message', 'Anda tidak terdaftar sebagai peserta aktif di event ini.');
    END IF;
  ELSE
    -- Jika solo event, check jika user terdaftar di event_participants
    SELECT EXISTS (
      SELECT 1 FROM public.event_participants
      WHERE event_id = p_event_id AND user_id = v_user_id
    ) INTO v_is_allowed;

    IF NOT v_is_allowed THEN
      RETURN json_build_object('success', false, 'message', 'Anda harus terdaftar di event ini terlebih dahulu.');
    END IF;
  END IF;

  -- Simpan atau Perbarui Write-Up (satu tim/peserta hanya memiliki satu dokumen WU final)
  IF v_is_team_event THEN
    INSERT INTO public.event_writeups (event_id, team_id, user_id, file_url, filename, submitted_at, status)
    VALUES (p_event_id, v_team_id, v_user_id, p_file_url, p_filename, now(), 'pending')
    ON CONFLICT (event_id, team_id) 
    DO UPDATE SET 
      user_id = EXCLUDED.user_id,
      file_url = EXCLUDED.file_url,
      filename = EXCLUDED.filename,
      submitted_at = now(),
      status = 'pending';
  ELSE
    -- Untuk solo event, we check uniqueness by event_id and user_id.
    -- (We add user_id filter dynamically)
    INSERT INTO public.event_writeups (event_id, team_id, user_id, file_url, filename, submitted_at, status)
    VALUES (p_event_id, NULL, v_user_id, p_file_url, p_filename, now(), 'pending')
    ON CONFLICT (event_id, team_id) WHERE team_id IS NULL -- ini perlu handling khusus
    DO UPDATE SET 
      file_url = EXCLUDED.file_url,
      filename = EXCLUDED.filename,
      submitted_at = now(),
      status = 'pending';
  END IF;

  RETURN json_build_object('success', true, 'message', 'Write-Up berhasil dikumpulkan.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION submit_event_writeup(UUID, TEXT, TEXT) TO authenticated;

-- 2) Admin mereview dan memberikan poin tambahan/pengurang berkas WU
CREATE OR REPLACE FUNCTION review_event_writeup(
  p_writeup_id UUID,
  p_status TEXT,
  p_score_adjustment INTEGER,
  p_admin_notes TEXT
)
RETURNS JSON AS $$
DECLARE
  v_admin_id UUID := auth.uid()::uuid;
  v_before JSONB;
  v_after JSONB;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can review writeups';
  END IF;

  SELECT jsonb_build_object(
    'status', status,
    'score_adjustment', score_adjustment,
    'admin_notes', admin_notes
  ) INTO v_before
  FROM public.event_writeups
  WHERE id = p_writeup_id;

  IF v_before IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Write-Up tidak ditemukan.');
  END IF;

  UPDATE public.event_writeups
  SET status = p_status,
      score_adjustment = p_score_adjustment,
      admin_notes = COALESCE(p_admin_notes, ''),
      submitted_at = submitted_at -- keep original submission time
  WHERE id = p_writeup_id;

  SELECT jsonb_build_object(
    'status', status,
    'score_adjustment', score_adjustment,
    'admin_notes', admin_notes
  ) INTO v_after
  FROM public.event_writeups
  WHERE id = p_writeup_id;

  PERFORM public.write_admin_audit_log(
    'REVIEW_WRITEUP',
    'event_writeup',
    p_writeup_id,
    v_before,
    v_after,
    '{}'::jsonb
  );

  RETURN json_build_object('success', true, 'message', 'Evaluasi Write-Up berhasil disimpan.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION review_event_writeup(UUID, TEXT, INTEGER, TEXT) TO authenticated;

-- 3) Admin list writeups per event
CREATE OR REPLACE FUNCTION list_event_writeups(p_event_id UUID)
RETURNS TABLE (
  writeup_id UUID,
  team_id UUID,
  team_name TEXT,
  user_id UUID,
  username TEXT,
  file_url TEXT,
  filename TEXT,
  submitted_at TIMESTAMPTZ,
  status TEXT,
  score_adjustment INTEGER,
  admin_notes TEXT
) AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    w.id AS writeup_id,
    w.team_id,
    t.name::TEXT AS team_name,
    w.user_id,
    u.username::TEXT,
    w.file_url::TEXT,
    w.filename::TEXT,
    w.submitted_at,
    w.status::TEXT,
    w.score_adjustment,
    w.admin_notes
  FROM public.event_writeups w
  LEFT JOIN public.teams t ON t.id = w.team_id
  JOIN public.users u ON u.id = w.user_id
  WHERE w.event_id = p_event_id
  ORDER BY w.submitted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION list_event_writeups(UUID) TO authenticated;

-- 4) Mendapatkan berkas WU milik tim/user sendiri
CREATE OR REPLACE FUNCTION get_my_team_writeup(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
  v_writeup RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  SELECT team_id INTO v_team_id
  FROM public.team_members
  WHERE user_id = v_user_id;

  IF v_team_id IS NOT NULL THEN
    SELECT id, file_url, filename, submitted_at, status, score_adjustment, admin_notes
    INTO v_writeup
    FROM public.event_writeups
    WHERE event_id = p_event_id AND team_id = v_team_id;
  ELSE
    SELECT id, file_url, filename, submitted_at, status, score_adjustment, admin_notes
    INTO v_writeup
    FROM public.event_writeups
    WHERE event_id = p_event_id AND user_id = v_user_id AND team_id IS NULL;
  END IF;

  IF NOT FOUND OR v_writeup.id IS NULL THEN
    RETURN json_build_object('success', true, 'has_submitted', false);
  END IF;

  RETURN json_build_object(
    'success', true,
    'has_submitted', true,
    'id', v_writeup.id,
    'file_url', v_writeup.file_url,
    'filename', v_writeup.filename,
    'submitted_at', v_writeup.submitted_at,
    'status', v_writeup.status,
    'score_adjustment', v_writeup.score_adjustment,
    'admin_notes', v_writeup.admin_notes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION get_my_team_writeup(UUID) TO authenticated;
