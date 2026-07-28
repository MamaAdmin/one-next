
-- Recreate view with security_invoker=true (avoids SECURITY DEFINER lint)
DROP VIEW IF EXISTS public.lms_course_ratings_public;

CREATE VIEW public.lms_course_ratings_public
WITH (security_invoker = true) AS
SELECT id, course_id, rating, review_text, created_at
FROM public.lms_course_ratings;

GRANT SELECT ON public.lms_course_ratings_public TO anon, authenticated;

-- Allow anon/authenticated to SELECT rows so the view can read them,
-- but revoke access to participant_id column so it is not exposed.
CREATE POLICY "Public can read ratings (columns restricted)"
  ON public.lms_course_ratings FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE SELECT (participant_id) ON public.lms_course_ratings FROM anon, authenticated;
REVOKE SELECT (enrollment_id)  ON public.lms_course_ratings FROM anon, authenticated;

-- Grant only safe columns explicitly
GRANT SELECT (id, course_id, rating, review_text, created_at, updated_at)
  ON public.lms_course_ratings TO anon, authenticated;
