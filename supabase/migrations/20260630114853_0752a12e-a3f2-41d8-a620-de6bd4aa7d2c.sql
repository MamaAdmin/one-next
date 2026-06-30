-- Restore EXECUTE on RLS-helper SECURITY DEFINER functions so policies work
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_sprint_member(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_company_admin(uuid, uuid) TO authenticated, anon;