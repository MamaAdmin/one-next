-- Sichere Hilfsfunktion: gibt nur die E-Mail des angemeldeten Benutzers zurück
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.current_user_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated;

-- bmad_invitations: Policies ohne auth.users-Zugriff neu definieren
DROP POLICY IF EXISTS "Authenticated users can view own pending invitation" ON public.bmad_invitations;
CREATE POLICY "Authenticated users can view own pending invitation"
ON public.bmad_invitations FOR SELECT TO authenticated
USING (status = 'pending' AND expires_at > now() AND email = public.current_user_email());

DROP POLICY IF EXISTS "Authenticated users can accept own invitation" ON public.bmad_invitations;
CREATE POLICY "Authenticated users can accept own invitation"
ON public.bmad_invitations FOR UPDATE TO authenticated
USING (email = public.current_user_email())
WITH CHECK (email = public.current_user_email());

-- user_invitations: SELECT-Policy ohne auth.users-Zugriff neu definieren
DROP POLICY IF EXISTS "Invited users can view their own invitation" ON public.user_invitations;
CREATE POLICY "Invited users can view their own invitation"
ON public.user_invitations FOR SELECT TO authenticated
USING (email = public.current_user_email());