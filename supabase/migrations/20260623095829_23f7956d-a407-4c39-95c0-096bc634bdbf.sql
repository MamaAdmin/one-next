
-- 1) articles
DROP POLICY IF EXISTS "Articles are publicly readable" ON public.articles;
CREATE POLICY "Published articles are publicly readable"
  ON public.articles FOR SELECT
  USING (status = 'published');

-- 2) bmad_invitations
DROP POLICY IF EXISTS "Anyone can view invitation by valid token" ON public.bmad_invitations;
DROP POLICY IF EXISTS "Users can view own invitation by token or email" ON public.bmad_invitations;

CREATE POLICY "Authenticated users can view own pending invitation"
  ON public.bmad_invitations FOR SELECT
  TO authenticated
  USING (
    status = 'pending'
    AND expires_at > now()
    AND email = ((SELECT users.email FROM auth.users WHERE users.id = auth.uid()))::text
  );

CREATE POLICY "Authenticated users can accept own invitation"
  ON public.bmad_invitations FOR UPDATE
  TO authenticated
  USING (
    email = ((SELECT users.email FROM auth.users WHERE users.id = auth.uid()))::text
  )
  WITH CHECK (
    email = ((SELECT users.email FROM auth.users WHERE users.id = auth.uid()))::text
  );

CREATE OR REPLACE FUNCTION public.get_bmad_invitation_by_token(p_token text)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  status text,
  expires_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, full_name, status, expires_at
  FROM public.bmad_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now()
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_bmad_invitation_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_bmad_invitation_by_token(text) TO anon, authenticated;

-- 3) lms_courses
DROP POLICY IF EXISTS "Everyone can view active courses" ON public.lms_courses;
CREATE POLICY "Everyone can view published active courses"
  ON public.lms_courses FOR SELECT
  USING (
    (is_active = true AND visibility = 'published')
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- 4) lms_quiz_questions
DROP POLICY IF EXISTS "Enrolled participants can view quiz questions" ON public.lms_quiz_questions;

CREATE OR REPLACE FUNCTION public.get_quiz_questions_for_participant(p_quiz_id uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question_text text,
  question_type text,
  options jsonb,
  points integer,
  sort_order integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.quiz_id, q.question_text, q.question_type, q.options, q.points, q.sort_order
  FROM public.lms_quiz_questions q
  WHERE q.quiz_id = p_quiz_id
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1
        FROM public.lms_quizzes qz
        JOIN public.lms_course_modules m ON qz.module_id = m.id
        JOIN public.lms_course_purchases pu ON m.course_id = pu.course_id
        JOIN public.lms_course_enrollments e ON e.purchase_id = pu.id
        JOIN public.participants pt ON e.participant_id = pt.id
        WHERE qz.id = p_quiz_id AND pt.user_id = auth.uid()
      )
    )
  ORDER BY q.sort_order;
$$;
REVOKE ALL ON FUNCTION public.get_quiz_questions_for_participant(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_for_participant(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.grade_quiz_attempt(
  p_attempt_id uuid,
  p_quiz_id uuid,
  p_answers jsonb,
  p_time_spent_seconds integer
)
RETURNS TABLE (score integer, is_passed boolean, correct_answers jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total integer := 0;
  v_earned integer := 0;
  v_passing integer;
  v_score integer;
  v_passed boolean;
  v_correct jsonb := '{}'::jsonb;
  r record;
  v_user_ans text;
  v_correct_ans text;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.lms_quiz_attempts qa
    JOIN public.lms_course_enrollments e ON qa.enrollment_id = e.id
    JOIN public.participants pt ON e.participant_id = pt.id
    WHERE qa.id = p_attempt_id
      AND qa.quiz_id = p_quiz_id
      AND pt.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized to grade this attempt';
  END IF;

  SELECT COALESCE(passing_score, 70) INTO v_passing FROM public.lms_quizzes WHERE id = p_quiz_id;

  FOR r IN
    SELECT id, question_type, correct_answer, points
    FROM public.lms_quiz_questions
    WHERE quiz_id = p_quiz_id
  LOOP
    v_total := v_total + COALESCE(r.points, 0);
    v_user_ans := p_answers ->> r.id::text;
    v_correct_ans := CASE
      WHEN jsonb_typeof(r.correct_answer) = 'array' THEN r.correct_answer ->> 0
      ELSE r.correct_answer #>> '{}'
    END;

    IF r.question_type IN ('multiple_choice', 'true_false') THEN
      IF v_user_ans IS NOT NULL AND v_user_ans = v_correct_ans THEN
        v_earned := v_earned + COALESCE(r.points, 0);
      END IF;
    ELSIF r.question_type = 'short_answer' THEN
      IF v_user_ans IS NOT NULL
         AND lower(btrim(v_user_ans)) = lower(btrim(COALESCE(v_correct_ans, ''))) THEN
        v_earned := v_earned + COALESCE(r.points, 0);
      END IF;
    END IF;

    v_correct := v_correct || jsonb_build_object(r.id::text, r.correct_answer);
  END LOOP;

  v_score := CASE WHEN v_total > 0 THEN (v_earned * 100) / v_total ELSE 0 END;
  v_passed := v_score >= v_passing;

  UPDATE public.lms_quiz_attempts
  SET completed_at = now(),
      score = v_score,
      is_passed = v_passed,
      time_spent_seconds = p_time_spent_seconds,
      answers = p_answers
  WHERE id = p_attempt_id;

  RETURN QUERY SELECT v_score, v_passed, v_correct;
END;
$$;
REVOKE ALL ON FUNCTION public.grade_quiz_attempt(uuid, uuid, jsonb, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grade_quiz_attempt(uuid, uuid, jsonb, integer) TO authenticated;

-- 5) sprint_bookings
DROP POLICY IF EXISTS "Authenticated users can update own bookings" ON public.sprint_bookings;
CREATE POLICY "Authenticated users can update own bookings"
  ON public.sprint_bookings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND email = ((SELECT users.email FROM auth.users WHERE users.id = auth.uid()))::text
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND email = ((SELECT users.email FROM auth.users WHERE users.id = auth.uid()))::text
  );

-- 6) SECURITY DEFINER trigger/helper EXECUTE
REVOKE EXECUTE ON FUNCTION public.update_course_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_content_version() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_artifact_achievement() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_enrollment_progress(uuid) FROM PUBLIC, anon, authenticated;

-- 7) Storage: restrict listing on public buckets
DROP POLICY IF EXISTS "Blog images are publicly accessible" ON storage.objects;
CREATE POLICY "Blog images listing restricted to authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Company logos are publicly viewable" ON storage.objects;
CREATE POLICY "Company logos listing restricted to authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'company-logos');
