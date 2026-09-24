ALTER TABLE public.scenes ADD COLUMN overlays jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.projects
  ADD COLUMN music_path text,
  ADD COLUMN music_volume numeric NOT NULL DEFAULT 0.3,
  ADD COLUMN subtitles_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN render_id text,
  ADD COLUMN render_status text,
  ADD COLUMN render_error text,
  ADD COLUMN export_path text,
  ADD COLUMN export_srt_path text;