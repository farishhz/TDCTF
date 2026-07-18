-- ==============================================
-- Table: flag_submissions
-- ==============================================

CREATE TABLE IF NOT EXISTS public.flag_submissions (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  incorrect_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  window_attempts INTEGER DEFAULT 0,
  window_start_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_flag_submissions_challenge ON public.flag_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_flag_submissions_last_attempt ON public.flag_submissions(last_attempt_at DESC);
