-- ==============================================
-- Table: system_settings
-- ==============================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value VARCHAR(255) NOT NULL,
  description VARCHAR(255) DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
