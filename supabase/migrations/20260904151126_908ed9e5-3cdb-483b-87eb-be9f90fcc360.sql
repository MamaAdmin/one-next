CREATE TABLE public.whiteboard_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Neues Whiteboard-Video',
  topic TEXT NOT NULL DEFAULT '',
  style TEXT NOT NULL DEFAULT 'whiteboard',
  voice TEXT NOT NULL DEFAULT 'alloy',
  scenes JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whiteboard_videos TO authenticated;
GRANT ALL ON public.whiteboard_videos TO service_role;

ALTER TABLE public.whiteboard_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whiteboard videos"
ON public.whiteboard_videos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_whiteboard_videos_updated_at
BEFORE UPDATE ON public.whiteboard_videos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();