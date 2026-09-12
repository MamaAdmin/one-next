ALTER TABLE public.whiteboard_videos
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'de';