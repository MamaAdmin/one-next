
-- 1) Fix mutable search_path on email queue functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- 2) media: hide uploader identity from public reads (revoke column-level SELECT)
REVOKE SELECT (uploaded_by) ON public.media FROM anon;
REVOKE SELECT (uploaded_by) ON public.media FROM authenticated;
-- Owners/admins still get it via service_role and can be granted back through views if needed.

-- 3) sprint_bookings: remove email-match SELECT policy to prevent spoofed pre-inserts
--    from becoming visible to a later same-email signup. Admin access is preserved
--    via the existing "Admins can manage all bookings" policy; booking owners access
--    their record server-side via session_token in edge functions.
DROP POLICY IF EXISTS "Authenticated users can view own bookings" ON public.sprint_bookings;
DROP POLICY IF EXISTS "Authenticated users can update own bookings" ON public.sprint_bookings;
