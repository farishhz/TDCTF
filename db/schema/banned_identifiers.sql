-- ==============================================
-- Table: banned_identifiers
-- ==============================================

CREATE TABLE IF NOT EXISTS public.banned_identifiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255),
  username VARCHAR(32),
  banned_until TIMESTAMP WITH TIME ZONE NOT NULL,
  ban_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banned_identifiers_email ON public.banned_identifiers(lower(email));
CREATE INDEX IF NOT EXISTS idx_banned_identifiers_username ON public.banned_identifiers(lower(username));
CREATE INDEX IF NOT EXISTS idx_banned_identifiers_until ON public.banned_identifiers(banned_until);

ALTER TABLE public.banned_identifiers ENABLE ROW LEVEL SECURITY;
