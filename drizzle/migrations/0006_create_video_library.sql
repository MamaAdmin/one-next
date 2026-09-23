CREATE TABLE public.video_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  provider text NOT NULL DEFAULT 'direct',
  slot_key text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX video_library_slot_key_unique ON public.video_library (slot_key) WHERE slot_key IS NOT NULL;

GRANT SELECT ON public.video_library TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_library TO authenticated;
GRANT ALL ON public.video_library TO service_role;

ALTER TABLE public.video_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videos sind öffentlich lesbar"
ON public.video_library FOR SELECT
USING (true);

CREATE POLICY "Admins können Videos anlegen"
ON public.video_library FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins können Videos ändern"
ON public.video_library FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins können Videos löschen"
ON public.video_library FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER video_library_set_updated_at
BEFORE UPDATE ON public.video_library
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();