-- ==============================================
-- Table: announcements & announcement_reads
-- ==============================================

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

ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
