-- ==============================================
-- Schema & Queries: announcements
-- ==============================================

-- 0. TABLE DEFINITIONS (Auto-migration if not exists)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  short_description TEXT,
  content TEXT NOT NULL,
  banner_image_url VARCHAR(2048),
  type VARCHAR(32) DEFAULT 'info' NOT NULL, -- 'info', 'event', 'maintenance', 'update', 'warning'
  priority VARCHAR(32) DEFAULT 'normal' NOT NULL, -- 'low', 'normal', 'high', 'critical'
  channels TEXT[] DEFAULT '{"modal", "notification"}'::TEXT[] NOT NULL, -- 'modal', 'top_banner', 'floating_card', 'notification'
  popup_style VARCHAR(32) DEFAULT 'modal' NOT NULL,
  status VARCHAR(32) DEFAULT 'draft' NOT NULL, -- 'draft', 'scheduled', 'published', 'archived'

  -- Target Audience
  target_type VARCHAR(32) DEFAULT 'all' NOT NULL, -- 'all', 'role', 'tags', 'event', 'team', 'specific_users'
  target_roles TEXT[] DEFAULT '{}'::TEXT[],
  target_tags TEXT[] DEFAULT '{}'::TEXT[],
  target_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  target_team_ids UUID[] DEFAULT '{}'::UUID[],
  target_user_ids UUID[] DEFAULT '{}'::UUID[],

  -- Scheduling
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,

  -- Display Behavior & Frequency
  display_rule VARCHAR(32) DEFAULT 'until_read' NOT NULL, -- 'first_visit', 'once_per_session', 'until_read', 'always'
  cooldown_hours INT DEFAULT 24 NOT NULL,
  is_dismissible BOOLEAN DEFAULT true NOT NULL,

  -- CTA (Call to Action)
  cta_text VARCHAR(100),
  cta_link VARCHAR(2048),
  cta_target VARCHAR(16) DEFAULT '_self',

  -- Metrics & Audit
  views_count INT DEFAULT 0 NOT NULL,
  reads_count INT DEFAULT 0 NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false NOT NULL,
  is_dismissed BOOLEAN DEFAULT false NOT NULL,
  view_count INT DEFAULT 1 NOT NULL,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_announcements_status_schedule 
  ON public.announcements(status, starts_at, ends_at);

CREATE INDEX IF NOT EXISTS idx_announcements_target_event 
  ON public.announcements(target_event_id) WHERE target_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_announcement_reads_user 
  ON public.announcement_reads(user_id, announcement_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  END IF;
END $$;

-- 1. USER: Fetch active announcements matching current user criteria
CREATE OR REPLACE FUNCTION get_active_announcements()
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  short_description TEXT,
  content TEXT,
  banner_image_url VARCHAR(2048),
  type VARCHAR(32),
  priority VARCHAR(32),
  channels TEXT[],
  popup_style VARCHAR(32),
  display_rule VARCHAR(32),
  cooldown_hours INT,
  is_dismissible BOOLEAN,
  cta_text VARCHAR(100),
  cta_link VARCHAR(2048),
  cta_target VARCHAR(16),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_read BOOLEAN,
  is_dismissed BOOLEAN,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_is_admin BOOLEAN := FALSE;
  v_user_tags TEXT[] := '{}'::TEXT[];
BEGIN
  IF v_user_id IS NOT NULL THEN
    SELECT is_admin, COALESCE(tags, '{}'::TEXT[])
    INTO v_is_admin, v_user_tags
    FROM public.users
    WHERE id = v_user_id;
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.short_description,
    a.content,
    a.banner_image_url,
    a.type,
    a.priority,
    a.channels,
    a.popup_style,
    a.display_rule,
    a.cooldown_hours,
    a.is_dismissible,
    a.cta_text,
    a.cta_link,
    a.cta_target,
    a.starts_at,
    a.ends_at,
    COALESCE(ar.is_read, FALSE) AS is_read,
    COALESCE(ar.is_dismissed, FALSE) AS is_dismissed,
    ar.last_seen_at,
    a.created_at
  FROM public.announcements a
  LEFT JOIN public.announcement_reads ar 
    ON ar.announcement_id = a.id AND ar.user_id = v_user_id
  WHERE a.status = 'published'
    AND a.starts_at <= now()
    AND (a.ends_at IS NULL OR a.ends_at >= now())
    -- Filter Target
    AND (
      a.target_type = 'all'
      OR (a.target_type = 'role' AND (
            ('admin' = ANY(a.target_roles) AND v_is_admin) OR
            ('user' = ANY(a.target_roles) AND NOT v_is_admin)
         ))
      OR (a.target_type = 'tags' AND a.target_tags && v_user_tags)
      OR (a.target_type = 'specific_users' AND v_user_id = ANY(a.target_user_ids))
    )
  ORDER BY 
    CASE a.priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'normal' THEN 3
      ELSE 4
    END,
    a.created_at DESC;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION get_active_announcements() TO anon, authenticated;

-- 2. USER: Record interaction (view, read, dismiss)
CREATE OR REPLACE FUNCTION record_announcement_interaction(
  p_announcement_id UUID,
  p_action TEXT -- 'view', 'read', 'dismiss'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
BEGIN
  IF v_user_id IS NULL THEN
    IF p_action = 'view' THEN
      UPDATE public.announcements SET views_count = views_count + 1 WHERE id = p_announcement_id;
    END IF;
    RETURN TRUE;
  END IF;

  INSERT INTO public.announcement_reads (
    announcement_id, user_id, is_read, is_dismissed, view_count, last_seen_at, read_at
  )
  VALUES (
    p_announcement_id,
    v_user_id,
    (p_action = 'read'),
    (p_action = 'dismiss'),
    1,
    now(),
    CASE WHEN p_action = 'read' THEN now() ELSE NULL END
  )
  ON CONFLICT (announcement_id, user_id) DO UPDATE
  SET 
    view_count = public.announcement_reads.view_count + 1,
    last_seen_at = now(),
    is_read = CASE WHEN p_action = 'read' THEN TRUE ELSE public.announcement_reads.is_read END,
    is_dismissed = CASE WHEN p_action = 'dismiss' THEN TRUE ELSE public.announcement_reads.is_dismissed END,
    read_at = CASE WHEN p_action = 'read' AND public.announcement_reads.read_at IS NULL THEN now() ELSE public.announcement_reads.read_at END;

  IF p_action = 'view' THEN
    UPDATE public.announcements SET views_count = views_count + 1 WHERE id = p_announcement_id;
  ELSIF p_action = 'read' THEN
    UPDATE public.announcements SET reads_count = reads_count + 1 WHERE id = p_announcement_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION record_announcement_interaction(UUID, TEXT) TO anon, authenticated;

-- 3. ADMIN: Get announcements list with search and filters
CREATE OR REPLACE FUNCTION admin_get_announcements(
  p_search TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  short_description TEXT,
  content TEXT,
  banner_image_url VARCHAR(2048),
  type VARCHAR(32),
  priority VARCHAR(32),
  channels TEXT[],
  popup_style VARCHAR(32),
  status VARCHAR(32),
  computed_status TEXT,
  target_type VARCHAR(32),
  target_roles TEXT[],
  target_tags TEXT[],
  target_event_id UUID,
  event_title TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  display_rule VARCHAR(32),
  cooldown_hours INT,
  is_dismissible BOOLEAN,
  cta_text VARCHAR(100),
  cta_link VARCHAR(2048),
  cta_target VARCHAR(16),
  views_count INT,
  reads_count INT,
  created_by UUID,
  author_username VARCHAR(32),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can view announcement management';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.short_description,
    a.content,
    a.banner_image_url,
    a.type,
    a.priority,
    a.channels,
    a.popup_style,
    a.status,
    CASE 
      WHEN a.status = 'draft' THEN 'draft'
      WHEN a.status = 'archived' THEN 'archived'
      WHEN a.starts_at > now() THEN 'scheduled'
      WHEN a.ends_at IS NOT NULL AND a.ends_at < now() THEN 'expired'
      ELSE 'published'
    END AS computed_status,
    a.target_type,
    a.target_roles,
    a.target_tags,
    a.target_event_id,
    e.name::TEXT AS event_title,
    a.starts_at,
    a.ends_at,
    a.display_rule,
    a.cooldown_hours,
    a.is_dismissible,
    a.cta_text,
    a.cta_link,
    a.cta_target,
    a.views_count,
    a.reads_count,
    a.created_by,
    u.username AS author_username,
    a.created_at,
    a.updated_at
  FROM public.announcements a
  LEFT JOIN public.users u ON u.id = a.created_by
  LEFT JOIN public.events e ON e.id = a.target_event_id
  WHERE (p_search IS NULL OR p_search = '' OR a.title ILIKE '%' || p_search || '%' OR a.content ILIKE '%' || p_search || '%')
    AND (p_status IS NULL OR p_status = '' OR a.status = p_status)
    AND (p_type IS NULL OR p_type = '' OR a.type = p_type)
  ORDER BY a.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION admin_get_announcements(TEXT, TEXT, TEXT, INT, INT) TO authenticated;

-- 4. ADMIN: Get Stats
CREATE OR REPLACE FUNCTION admin_get_announcement_stats()
RETURNS JSON AS $$
DECLARE
  v_total INT := 0;
  v_published INT := 0;
  v_scheduled INT := 0;
  v_active INT := 0;
  v_expired INT := 0;
  v_draft INT := 0;
  v_total_views INT := 0;
  v_total_reads INT := 0;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can view announcement stats';
  END IF;

  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'published'),
    COUNT(*) FILTER (WHERE status = 'published' AND starts_at > now()),
    COUNT(*) FILTER (WHERE status = 'published' AND starts_at <= now() AND (ends_at IS NULL OR ends_at >= now())),
    COUNT(*) FILTER (WHERE status = 'published' AND ends_at IS NOT NULL AND ends_at < now()),
    COUNT(*) FILTER (WHERE status = 'draft'),
    COALESCE(SUM(views_count), 0),
    COALESCE(SUM(reads_count), 0)
  INTO 
    v_total, v_published, v_scheduled, v_active, v_expired, v_draft, v_total_views, v_total_reads
  FROM public.announcements;

  RETURN json_build_object(
    'total', v_total,
    'published', v_published,
    'scheduled', v_scheduled,
    'active', v_active,
    'expired', v_expired,
    'draft', v_draft,
    'total_views', v_total_views,
    'total_reads', v_total_reads
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION admin_get_announcement_stats() TO authenticated;

-- 5. ADMIN: Create announcement
CREATE OR REPLACE FUNCTION admin_create_announcement(
  p_title VARCHAR(255),
  p_short_description TEXT,
  p_content TEXT,
  p_banner_image_url VARCHAR(2048),
  p_type VARCHAR(32),
  p_priority VARCHAR(32),
  p_channels TEXT[],
  p_popup_style VARCHAR(32),
  p_status VARCHAR(32),
  p_target_type VARCHAR(32),
  p_target_roles TEXT[],
  p_target_tags TEXT[],
  p_target_event_id UUID,
  p_starts_at TIMESTAMPTZ,
  p_ends_at TIMESTAMPTZ,
  p_display_rule VARCHAR(32),
  p_cooldown_hours INT,
  p_is_dismissible BOOLEAN,
  p_cta_text VARCHAR(100),
  p_cta_link VARCHAR(2048),
  p_cta_target VARCHAR(16)
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_new_id UUID;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can create announcements';
  END IF;

  INSERT INTO public.announcements (
    title, short_description, content, banner_image_url, type, priority,
    channels, popup_style, status, target_type, target_roles, target_tags, target_event_id,
    starts_at, ends_at, display_rule, cooldown_hours, is_dismissible,
    cta_text, cta_link, cta_target, created_by
  )
  VALUES (
    p_title, p_short_description, p_content, p_banner_image_url, p_type, p_priority,
    COALESCE(p_channels, '{"modal", "notification"}'::TEXT[]), p_popup_style, p_status, 
    p_target_type, p_target_roles, p_target_tags, p_target_event_id,
    p_starts_at, p_ends_at, p_display_rule, p_cooldown_hours, p_is_dismissible,
    p_cta_text, p_cta_link, p_cta_target, v_user_id
  )
  RETURNING id INTO v_new_id;

  PERFORM public.write_admin_audit_log(
    'INSERT',
    'announcement',
    v_new_id,
    NULL,
    jsonb_build_object('title', p_title, 'type', p_type, 'status', p_status),
    jsonb_build_object('action', 'create_announcement')
  );

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION admin_create_announcement(VARCHAR, TEXT, TEXT, VARCHAR, VARCHAR, VARCHAR, TEXT[], VARCHAR, VARCHAR, VARCHAR, TEXT[], TEXT[], UUID, TIMESTAMPTZ, TIMESTAMPTZ, VARCHAR, INT, BOOLEAN, VARCHAR, VARCHAR, VARCHAR) TO authenticated;

-- 6. ADMIN: Update announcement
CREATE OR REPLACE FUNCTION admin_update_announcement(
  p_id UUID,
  p_title VARCHAR(255),
  p_short_description TEXT,
  p_content TEXT,
  p_banner_image_url VARCHAR(2048),
  p_type VARCHAR(32),
  p_priority VARCHAR(32),
  p_channels TEXT[],
  p_popup_style VARCHAR(32),
  p_status VARCHAR(32),
  p_target_type VARCHAR(32),
  p_target_roles TEXT[],
  p_target_tags TEXT[],
  p_target_event_id UUID,
  p_starts_at TIMESTAMPTZ,
  p_ends_at TIMESTAMPTZ,
  p_display_rule VARCHAR(32),
  p_cooldown_hours INT,
  p_is_dismissible BOOLEAN,
  p_cta_text VARCHAR(100),
  p_cta_link VARCHAR(2048),
  p_cta_target VARCHAR(16)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_before JSONB;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can update announcements';
  END IF;

  SELECT row_to_json(a)::JSONB INTO v_before
  FROM public.announcements a WHERE a.id = p_id;

  IF v_before IS NULL THEN
    RAISE EXCEPTION 'Announcement not found';
  END IF;

  UPDATE public.announcements
  SET 
    title = p_title,
    short_description = p_short_description,
    content = p_content,
    banner_image_url = p_banner_image_url,
    type = p_type,
    priority = p_priority,
    channels = COALESCE(p_channels, '{"modal", "notification"}'::TEXT[]),
    popup_style = p_popup_style,
    status = p_status,
    target_type = p_target_type,
    target_roles = p_target_roles,
    target_tags = p_target_tags,
    target_event_id = p_target_event_id,
    starts_at = p_starts_at,
    ends_at = p_ends_at,
    display_rule = p_display_rule,
    cooldown_hours = p_cooldown_hours,
    is_dismissible = p_is_dismissible,
    cta_text = p_cta_text,
    cta_link = p_cta_link,
    cta_target = p_cta_target,
    updated_at = now()
  WHERE id = p_id;

  PERFORM public.write_admin_audit_log(
    'UPDATE',
    'announcement',
    p_id,
    v_before,
    jsonb_build_object('title', p_title, 'type', p_type, 'status', p_status),
    jsonb_build_object('action', 'update_announcement')
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION admin_update_announcement(UUID, VARCHAR, TEXT, TEXT, VARCHAR, VARCHAR, VARCHAR, TEXT[], VARCHAR, VARCHAR, VARCHAR, TEXT[], TEXT[], UUID, TIMESTAMPTZ, TIMESTAMPTZ, VARCHAR, INT, BOOLEAN, VARCHAR, VARCHAR, VARCHAR) TO authenticated;

-- 7. ADMIN: Duplicate announcement
CREATE OR REPLACE FUNCTION admin_duplicate_announcement(
  p_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_orig RECORD;
  v_user_id UUID := auth.uid()::uuid;
  v_new_id UUID;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can duplicate announcements';
  END IF;

  SELECT * INTO v_orig
  FROM public.announcements
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Announcement not found';
  END IF;

  INSERT INTO public.announcements (
    title, short_description, content, banner_image_url, type, priority,
    channels, popup_style, status, target_type, target_roles, target_tags, target_event_id,
    starts_at, ends_at, display_rule, cooldown_hours, is_dismissible,
    cta_text, cta_link, cta_target, created_by
  )
  VALUES (
    v_orig.title || ' (Copy)', v_orig.short_description, v_orig.content, v_orig.banner_image_url, 
    v_orig.type, v_orig.priority, v_orig.channels, v_orig.popup_style, 'draft', 
    v_orig.target_type, v_orig.target_roles, v_orig.target_tags, v_orig.target_event_id,
    now(), v_orig.ends_at, v_orig.display_rule, v_orig.cooldown_hours, v_orig.is_dismissible,
    v_orig.cta_text, v_orig.cta_link, v_orig.cta_target, v_user_id
  )
  RETURNING id INTO v_new_id;

  PERFORM public.write_admin_audit_log(
    'INSERT',
    'announcement',
    v_new_id,
    NULL,
    jsonb_build_object('title', v_orig.title || ' (Copy)', 'duplicated_from', p_id),
    jsonb_build_object('action', 'duplicate_announcement')
  );

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION admin_duplicate_announcement(UUID) TO authenticated;

-- 8. ADMIN: Delete announcement
CREATE OR REPLACE FUNCTION admin_delete_announcement(
  p_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_before JSONB;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can delete announcements';
  END IF;

  SELECT row_to_json(a)::JSONB INTO v_before
  FROM public.announcements a WHERE a.id = p_id;

  DELETE FROM public.announcements WHERE id = p_id;

  PERFORM public.write_admin_audit_log(
    'DELETE',
    'announcement',
    p_id,
    v_before,
    NULL,
    jsonb_build_object('action', 'delete_announcement')
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth, extensions;

GRANT EXECUTE ON FUNCTION admin_delete_announcement(UUID) TO authenticated;

-- 9. RLS POLICIES
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Announcements readable by everyone" ON public.announcements;
CREATE POLICY "Announcements readable by everyone"
  ON public.announcements
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Announcements manageable by admin" ON public.announcements;
CREATE POLICY "Announcements manageable by admin"
  ON public.announcements
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Announcement reads user self" ON public.announcement_reads;
CREATE POLICY "Announcement reads user self"
  ON public.announcement_reads
  FOR ALL
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());
