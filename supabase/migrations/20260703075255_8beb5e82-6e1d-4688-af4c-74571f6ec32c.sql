-- Harden SECURITY DEFINER function EXECUTE grants.
-- Revoke public/anon access from helper functions that must not be callable
-- by unauthenticated users. RLS helpers (has_role, is_*_member, can_edit_*)
-- still need EXECUTE for the authenticated role because they are invoked
-- from within RLS policies during authenticated queries.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_sprint_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_framing_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_company_admin(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_edit_sprint(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_edit_framing(uuid, uuid) FROM PUBLIC, anon;

-- These are only intended for authenticated participants / admins.
REVOKE EXECUTE ON FUNCTION public.calculate_enrollment_progress(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_quiz_questions_for_participant(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grade_quiz_attempt(uuid, uuid, jsonb, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_faq_view(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_faq_vote(uuid, boolean) FROM PUBLIC, anon;

-- get_bmad_invitation_by_token is intentionally callable by anon (used on
-- the public invitation acceptance page before sign-in).
-- Keep as-is.

GRANT EXECUTE ON FUNCTION public.get_quiz_questions_for_participant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_faq_view(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_faq_vote(uuid, boolean) TO authenticated;
