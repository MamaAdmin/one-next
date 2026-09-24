CREATE TABLE public.youtube_connection (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  channel_id text,
  channel_title text,
  refresh_token text,
  connected_at timestamptz NOT NULL DEFAULT now(),
  connected_by uuid
);
GRANT ALL ON public.youtube_connection TO service_role;
ALTER TABLE public.youtube_connection ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.whiteboard_videos
  ADD COLUMN IF NOT EXISTS target_slot_key text,
  ADD COLUMN IF NOT EXISTS youtube_video_id text,
  ADD COLUMN IF NOT EXISTS youtube_status text,
  ADD COLUMN IF NOT EXISTS youtube_error text;
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS target_slot_key text,
  ADD COLUMN IF NOT EXISTS youtube_video_id text,
  ADD COLUMN IF NOT EXISTS youtube_status text,
  ADD COLUMN IF NOT EXISTS youtube_error text;