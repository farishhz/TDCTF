-- ==============================================
-- Table: admin_audit_logs
-- ==============================================

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_snapshot TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID DEFAULT NULL,
  changed_fields TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  before_data JSONB DEFAULT NULL,
  after_data JSONB DEFAULT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT admin_audit_logs_action_not_empty CHECK (btrim(action) <> ''),
  CONSTRAINT admin_audit_logs_entity_type_not_empty CHECK (btrim(entity_type) <> ''),
  CONSTRAINT admin_audit_logs_actor_role_check CHECK (actor_role IN ('global_admin', 'admin'))
);

ALTER TABLE public.admin_audit_logs
  DROP CONSTRAINT IF EXISTS admin_audit_logs_actor_role_check;

UPDATE public.admin_audit_logs
SET actor_role = 'admin'
WHERE actor_role NOT IN ('global_admin', 'admin');

ALTER TABLE public.admin_audit_logs
  ADD CONSTRAINT admin_audit_logs_actor_role_check
  CHECK (actor_role IN ('global_admin', 'admin'));

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_created
  ON public.admin_audit_logs(actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity_created
  ON public.admin_audit_logs(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action_created
  ON public.admin_audit_logs(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at
  ON public.admin_audit_logs(created_at DESC);
