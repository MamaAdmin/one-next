ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sprint_delete_count integer NOT NULL DEFAULT 0;