
ALTER TABLE public.lms_courses
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_course_id uuid REFERENCES public.public_courses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS lms_courses_public_course_id_idx ON public.lms_courses(public_course_id);
CREATE INDEX IF NOT EXISTS lms_courses_is_public_idx ON public.lms_courses(is_public);

-- Sync existing public_courses into lms_courses (skip if slug already exists)
INSERT INTO public.lms_courses (
  title, description_html, course_type, price_chf, is_active,
  featured_image, slug, visibility, is_public, public_course_id, pricing
)
SELECT
  pc.title,
  COALESCE(pc.description_html, pc.description),
  'public'::text,
  pc.price_chf,
  pc.is_active,
  pc.featured_image,
  pc.slug,
  CASE WHEN pc.is_active THEN 'public' ELSE 'draft' END,
  true,
  pc.id,
  jsonb_build_object('type', 'paid', 'currency', pc.currency, 'price_chf', pc.price_chf)
FROM public.public_courses pc
WHERE NOT EXISTS (
  SELECT 1 FROM public.lms_courses lc WHERE lc.public_course_id = pc.id OR lc.slug = pc.slug
);
