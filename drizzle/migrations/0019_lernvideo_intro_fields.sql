ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS intro_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS intro_text text,
  ADD COLUMN IF NOT EXISTS intro_seconds numeric NOT NULL DEFAULT 4;