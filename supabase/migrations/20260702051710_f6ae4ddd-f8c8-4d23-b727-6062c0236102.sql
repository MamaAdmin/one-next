ALTER TABLE public.sprints
  ADD COLUMN IF NOT EXISTS challenge_statement text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS zielgruppe text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS erfolgsmessung text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sprint_fragen jsonb NOT NULL DEFAULT '[]'::jsonb;