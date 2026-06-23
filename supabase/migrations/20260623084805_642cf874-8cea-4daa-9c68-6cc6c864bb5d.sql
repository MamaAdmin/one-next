
-- Fix mutable search_path on all public functions
ALTER FUNCTION public.check_all_phases_achievement() SET search_path = public;
ALTER FUNCTION public.update_course_rating() SET search_path = public;
ALTER FUNCTION public.update_faq_updated_at() SET search_path = public;
ALTER FUNCTION public.check_streak_achievement() SET search_path = public;
ALTER FUNCTION public.log_module_activity() SET search_path = public;
ALTER FUNCTION public.calculate_streak(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_enrollment_progress(uuid) SET search_path = public;
ALTER FUNCTION public.increment_faq_view(uuid) SET search_path = public;
ALTER FUNCTION public.record_faq_vote(uuid, boolean) SET search_path = public;
ALTER FUNCTION public.check_first_phase_achievement() SET search_path = public;
ALTER FUNCTION public.update_progress_on_quiz_pass() SET search_path = public;
ALTER FUNCTION public.check_artifact_achievement() SET search_path = public;

-- Tighten permissive RLS policies (replace WITH CHECK (true))

-- sprint_bookings: require safe initial status values
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.sprint_bookings;
CREATE POLICY "Anyone can create bookings"
  ON public.sprint_bookings
  FOR INSERT
  WITH CHECK (
    booking_status = 'pending'
    AND payment_status = 'unpaid'
    AND payment_id IS NULL
  );

-- faq_feedback: require valid faq_id reference
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.faq_feedback;
CREATE POLICY "Anyone can submit feedback"
  ON public.faq_feedback
  FOR INSERT
  WITH CHECK (
    faq_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.faq_items WHERE id = faq_id)
  );

-- public_course_registrations: registrations are created server-side via edge function (service_role).
-- Remove the open anon INSERT policy.
DROP POLICY IF EXISTS "Anyone can register for courses" ON public.public_course_registrations;
