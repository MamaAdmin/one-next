
-- ============================================================
-- 1. STORAGE POLICIES: blog-images
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own blog images" ON storage.objects;

CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Users can upload own blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'content_manager'::app_role)
  )
);

CREATE POLICY "Users can update own blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'content_manager'::app_role)
  )
);

CREATE POLICY "Users can delete own blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'content_manager'::app_role)
  )
);

-- ============================================================
-- 2. STORAGE POLICIES: company-logos
-- ============================================================
DROP POLICY IF EXISTS "Company admins can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view company logos" ON storage.objects;

CREATE POLICY "Public can view company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

CREATE POLICY "Company admins can upload own company logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos'
  AND public.is_company_admin(auth.uid(), ((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "Company admins can update own company logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND public.is_company_admin(auth.uid(), ((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "Company admins can delete own company logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND public.is_company_admin(auth.uid(), ((storage.foldername(name))[1])::uuid)
);

-- ============================================================
-- 3. CUSTOMERS: allow participants to view their own company
-- ============================================================
DROP POLICY IF EXISTS "Participants can view own customer" ON public.customers;
CREATE POLICY "Participants can view own customer"
ON public.customers FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT customer_id FROM public.participants WHERE user_id = auth.uid()
  )
);

-- ============================================================
-- 4. FUNCTION SEARCH PATH: fix mutable search_path
-- ============================================================
ALTER FUNCTION public.enqueue_email(text, jsonb)  SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint)  SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb)   SET search_path = public, pgmq;

-- ============================================================
-- 5. REVOKE EXECUTE on SECURITY DEFINER functions not meant to be called by clients
-- ============================================================

-- Trigger functions (never called directly)
REVOKE ALL ON FUNCTION public.check_all_phases_achievement()       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_artifact_achievement()         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_first_phase_achievement()      FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_streak_achievement()           FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_content_version()             FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user()                    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_module_activity()                FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_course_slug()                    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_course_rating()               FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_faq_updated_at()              FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_progress_on_quiz_pass()       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column()           FROM PUBLIC, anon, authenticated;

-- Internal email queue / cron functions
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb)                          FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint)                          FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer)            FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb)              FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_dispatch()                              FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_wake()                                  FROM PUBLIC, anon, authenticated;

-- Helper / utility (called only server-side or via trigger)
REVOKE ALL ON FUNCTION public.generate_unique_slug(text, uuid)                    FROM PUBLIC, anon, authenticated;

-- Client-callable RPCs: explicit narrow grants
-- RLS helpers are executed inside policy evaluation as the calling role.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role)                         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_admin(uuid, uuid)                     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_sprint_member(uuid, uuid)                     TO anon, authenticated;

-- Explicitly re-grant client-callable RPCs to their intended audience
REVOKE ALL ON FUNCTION public.get_quiz_questions_for_participant(uuid)            FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_quiz_questions_for_participant(uuid)        TO authenticated;

REVOKE ALL ON FUNCTION public.grade_quiz_attempt(uuid, uuid, jsonb, integer)      FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.grade_quiz_attempt(uuid, uuid, jsonb, integer)  TO authenticated;

REVOKE ALL ON FUNCTION public.calculate_enrollment_progress(uuid)                 FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.calculate_enrollment_progress(uuid)             TO authenticated;

REVOKE ALL ON FUNCTION public.calculate_streak(uuid)                              FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.calculate_streak(uuid)                          TO authenticated;

-- FAQ interactions may be triggered from public pages
GRANT EXECUTE ON FUNCTION public.increment_faq_view(uuid)                         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_faq_vote(uuid, boolean)                   TO anon, authenticated;

-- BMAD invitation lookup: needed by anonymous invite acceptance page
GRANT EXECUTE ON FUNCTION public.get_bmad_invitation_by_token(text)               TO anon, authenticated;
