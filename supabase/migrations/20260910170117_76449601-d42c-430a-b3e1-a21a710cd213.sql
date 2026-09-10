CREATE TABLE public.whiteboard_video_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Neue Serie',
  description text NOT NULL DEFAULT '',
  style text NOT NULL DEFAULT 'whiteboard',
  script_type text NOT NULL DEFAULT 'erklaerung',
  voice text NOT NULL DEFAULT 'alloy',
  image_model text NOT NULL DEFAULT '',
  voice_model text NOT NULL DEFAULT '',
  video_model text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whiteboard_video_series TO authenticated;
GRANT ALL ON public.whiteboard_video_series TO service_role;

ALTER TABLE public.whiteboard_video_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whiteboard video series"
ON public.whiteboard_video_series
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_whiteboard_video_series_updated_at
BEFORE UPDATE ON public.whiteboard_video_series
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.whiteboard_videos
  ADD COLUMN series_id uuid NULL REFERENCES public.whiteboard_video_series(id) ON DELETE SET NULL,
  ADD COLUMN position integer NULL;

CREATE INDEX idx_whiteboard_videos_series ON public.whiteboard_videos (series_id, position);