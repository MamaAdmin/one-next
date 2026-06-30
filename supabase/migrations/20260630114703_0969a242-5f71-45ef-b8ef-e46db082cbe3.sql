
-- 1) Lock down SECURITY DEFINER function execution
-- Revoke EXECUTE from PUBLIC/anon/authenticated on all SECURITY DEFINER helpers,
-- then re-grant only on functions intentionally exposed as RPCs.

DO $$
DECLARE
  f record;
BEGIN
  FOR f IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format(
      'REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC, anon, authenticated',
      f.nspname, f.proname, f.args
    );
  END LOOP;
END
$$;

-- Re-grant on intentional public/authenticated RPCs only.
GRANT EXECUTE ON FUNCTION public.get_bmad_invitation_by_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_for_participant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grade_quiz_attempt(uuid, uuid, jsonb, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_faq_view(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_faq_vote(uuid, boolean) TO anon, authenticated;

-- 2) lms_quiz_questions: defensively revoke direct column access (in case future
-- grants widen). Participants access questions via SECURITY DEFINER RPC
-- public.get_quiz_questions_for_participant which excludes correct_answer.
REVOKE SELECT ON public.lms_quiz_questions FROM anon, authenticated;

-- 3) public_course_registrations: allow guest checkout INSERT with constraints.
CREATE POLICY "Guests can submit registrations"
  ON public.public_course_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    payment_status = 'pending'
    AND user_id IS NULL
    AND length(first_name) BETWEEN 1 AND 100
    AND length(last_name) BETWEEN 1 AND 100
    AND length(email) BETWEEN 5 AND 254
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (phone IS NULL OR length(phone) <= 40)
    AND (company IS NULL OR length(company) <= 200)
  );

-- Authenticated users may also insert their own registration with their user_id set.
CREATE POLICY "Authenticated users can register themselves"
  ON public.public_course_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    payment_status = 'pending'
    AND user_id = auth.uid()
    AND length(first_name) BETWEEN 1 AND 100
    AND length(last_name) BETWEEN 1 AND 100
    AND length(email) BETWEEN 5 AND 254
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

-- 4) sprint_bookings: harden anonymous INSERT to limit abuse of personal-data submissions.
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.sprint_bookings;

CREATE POLICY "Anyone can create bookings"
  ON public.sprint_bookings
  FOR INSERT
  WITH CHECK (
    booking_status = 'pending'
    AND payment_status = 'unpaid'
    AND payment_id IS NULL
    AND length(name) BETWEEN 1 AND 120
    AND length(email) BETWEEN 5 AND 254
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(challenge_description) BETWEEN 1 AND 5000
    AND length(relevance_reason) BETWEEN 1 AND 5000
    AND length(consequences) BETWEEN 1 AND 5000
    AND length(success_criteria) BETWEEN 1 AND 5000
    AND (company IS NULL OR length(company) <= 200)
    AND (notes IS NULL OR length(notes) <= 5000)
    AND team_size BETWEEN 2 AND 50
    AND array_length(target_audience, 1) BETWEEN 1 AND 20
  );
