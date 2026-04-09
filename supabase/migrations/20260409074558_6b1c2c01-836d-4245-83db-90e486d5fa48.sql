
CREATE TABLE public.public_course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.public_courses(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  module_type TEXT NOT NULL DEFAULT 'content',
  content_html TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  youtube_url TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.public_course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public course modules are publicly readable"
ON public.public_course_modules
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage public course modules"
ON public.public_course_modules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_public_course_modules_course_id ON public.public_course_modules(course_id);

CREATE TRIGGER update_public_course_modules_updated_at
BEFORE UPDATE ON public.public_course_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
