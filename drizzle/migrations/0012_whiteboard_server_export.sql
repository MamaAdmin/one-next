ALTER TABLE public.whiteboard_videos
  ADD COLUMN IF NOT EXISTS render_id text,
  ADD COLUMN IF NOT EXISTS render_status text,
  ADD COLUMN IF NOT EXISTS render_error text,
  ADD COLUMN IF NOT EXISTS export_path text,
  ADD COLUMN IF NOT EXISTS export_srt_path text;