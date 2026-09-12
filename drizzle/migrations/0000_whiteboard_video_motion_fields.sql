ALTER TABLE public.whiteboard_videos
  ADD COLUMN IF NOT EXISTS music_url text,
  ADD COLUMN IF NOT EXISTS music_volume numeric NOT NULL DEFAULT 0.18,
  ADD COLUMN IF NOT EXISTS seed integer,
  ADD COLUMN IF NOT EXISTS style_ref_url text;