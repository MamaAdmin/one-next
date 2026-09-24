ALTER TABLE public.whiteboard_videos
  ADD COLUMN IF NOT EXISTS image_direction text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS style_ref_path text NULL;

COMMENT ON COLUMN public.whiteboard_videos.image_direction IS 'Per-video visual direction appended to generated image descriptions.';
COMMENT ON COLUMN public.whiteboard_videos.style_ref_path IS 'Private whiteboard-uploads object path for the visual reference image.';