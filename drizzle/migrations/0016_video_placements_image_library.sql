CREATE TABLE public.video_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_key text NOT NULL UNIQUE,
  label text NOT NULL,
  page_path text NOT NULL,
  position text NOT NULL DEFAULT 'bottom',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.video_placements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_placements TO authenticated;
GRANT ALL ON public.video_placements TO service_role;
ALTER TABLE public.video_placements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Placements readable by all" ON public.video_placements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage placements" ON public.video_placements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER video_placements_updated BEFORE UPDATE ON public.video_placements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.image_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL UNIQUE,
  storage_path text,
  prompt text,
  source text NOT NULL DEFAULT 'whiteboard',
  video_id uuid,
  video_title text,
  scene_index integer,
  style text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.image_library TO authenticated;
GRANT ALL ON public.image_library TO service_role;
ALTER TABLE public.image_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Editors manage image library" ON public.image_library FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));