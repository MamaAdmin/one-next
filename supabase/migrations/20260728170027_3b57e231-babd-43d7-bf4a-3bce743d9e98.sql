
-- Restrict raw table SELECT so participant_id is not publicly readable
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.lms_course_ratings;

CREATE POLICY "Users can view own ratings"
  ON public.lms_course_ratings FOR SELECT
  TO authenticated
  USING (
    participant_id IN (SELECT id FROM public.participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all ratings"
  ON public.lms_course_ratings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Public, anonymized view for course rating display (no participant_id)
CREATE OR REPLACE VIEW public.lms_course_ratings_public
WITH (security_invoker = true) AS
SELECT
  id,
  course_id,
  rating,
  review_text,
  created_at
FROM public.lms_course_ratings;

-- The view relies on its own grants; underlying table stays locked down.
-- Since security_invoker=true respects RLS of caller, we need a permissive
-- policy that lets anon/auth read only the non-identifying columns via the view.
-- Simplest: add a SELECT policy scoped to anon/authenticated that only the view uses
-- by revoking direct table SELECT from those roles is not needed — the view exposes
-- only safe columns and RLS still applies. Add a permissive policy for the view path:
CREATE POLICY "Public can view rating aggregates via view"
  ON public.lms_course_ratings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: keeping this permissive policy would re-expose participant_id on the base
-- table. Instead, revoke column access on participant_id so it cannot be selected
-- by anon/authenticated, and drop the permissive policy above; only the view's
-- projected columns are safe.
DROP POLICY "Public can view rating aggregates via view" ON public.lms_course_ratings;

-- Better approach: switch view to SECURITY DEFINER-like behavior by using
-- security_invoker=false so it bypasses RLS but only exposes safe columns.
DROP VIEW public.lms_course_ratings_public;

CREATE VIEW public.lms_course_ratings_public
WITH (security_invoker = false) AS
SELECT
  id,
  course_id,
  rating,
  review_text,
  created_at
FROM public.lms_course_ratings;

GRANT SELECT ON public.lms_course_ratings_public TO anon, authenticated;
