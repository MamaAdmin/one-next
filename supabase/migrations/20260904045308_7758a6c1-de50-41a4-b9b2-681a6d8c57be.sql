CREATE OR REPLACE FUNCTION public.get_own_course_rating(p_course_id uuid)
RETURNS TABLE(id uuid, course_id uuid, enrollment_id uuid, rating integer, review_text text, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.course_id, r.enrollment_id, r.rating, r.review_text, r.created_at, r.updated_at
  FROM public.lms_course_ratings r
  JOIN public.participants p ON p.id = r.participant_id
  WHERE r.course_id = p_course_id
    AND p.user_id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_own_course_rating(uuid) TO authenticated;