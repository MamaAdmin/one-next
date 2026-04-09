-- Fix 1: design_sprint_sessions - broken RLS policies
DROP POLICY IF EXISTS "Users can read own sessions" ON public.design_sprint_sessions;
CREATE POLICY "Users can read own sessions" ON public.design_sprint_sessions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own sessions" ON public.design_sprint_sessions;
CREATE POLICY "Users can update own sessions" ON public.design_sprint_sessions
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.design_sprint_sessions;
CREATE POLICY "Users can delete own sessions" ON public.design_sprint_sessions
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can create sessions" ON public.design_sprint_sessions;
CREATE POLICY "Authenticated users can create sessions" ON public.design_sprint_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Fix 2: bmad_conversations - open INSERT policy
DROP POLICY IF EXISTS "System can insert conversations" ON public.bmad_conversations;
CREATE POLICY "BMAD users can insert own conversations" ON public.bmad_conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'bmad_user'::app_role) 
    AND session_id IN (
      SELECT id FROM bmad_sessions WHERE created_by = auth.uid()
    )
  );