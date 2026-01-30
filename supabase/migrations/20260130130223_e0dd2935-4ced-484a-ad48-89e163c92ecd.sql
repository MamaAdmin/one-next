-- Create BMAD user invitations table
CREATE TABLE public.bmad_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.bmad_invitations ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invitations
CREATE POLICY "Admins can manage BMAD invitations"
  ON public.bmad_invitations FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Anyone can view pending invitations (for accepting by token)
CREATE POLICY "Anyone can view pending invitations"
  ON public.bmad_invitations FOR SELECT
  USING (status = 'pending' AND expires_at > now());

-- Update bmad_sessions RLS to allow bmad_users to see their own sessions
DROP POLICY IF EXISTS "Admins can manage all sessions" ON public.bmad_sessions;

CREATE POLICY "Admins can manage all sessions"
  ON public.bmad_sessions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "BMAD users can view own sessions"
  ON public.bmad_sessions FOR SELECT
  USING (has_role(auth.uid(), 'bmad_user') AND created_by = auth.uid());

CREATE POLICY "BMAD users can create sessions"
  ON public.bmad_sessions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'bmad_user') AND created_by = auth.uid());

CREATE POLICY "BMAD users can update own sessions"
  ON public.bmad_sessions FOR UPDATE
  USING (has_role(auth.uid(), 'bmad_user') AND created_by = auth.uid());

CREATE POLICY "BMAD users can delete own sessions"
  ON public.bmad_sessions FOR DELETE
  USING (has_role(auth.uid(), 'bmad_user') AND created_by = auth.uid());

-- Update bmad_artifacts RLS
DROP POLICY IF EXISTS "Admins can manage all artifacts" ON public.bmad_artifacts;

CREATE POLICY "Admins can manage all artifacts"
  ON public.bmad_artifacts FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "BMAD users can manage own artifacts"
  ON public.bmad_artifacts FOR ALL
  USING (
    has_role(auth.uid(), 'bmad_user') AND
    session_id IN (SELECT id FROM public.bmad_sessions WHERE created_by = auth.uid())
  );

-- Update bmad_conversations RLS
DROP POLICY IF EXISTS "Admins can manage all conversations" ON public.bmad_conversations;

CREATE POLICY "Admins can manage all conversations"
  ON public.bmad_conversations FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "BMAD users can manage own conversations"
  ON public.bmad_conversations FOR ALL
  USING (
    has_role(auth.uid(), 'bmad_user') AND
    session_id IN (SELECT id FROM public.bmad_sessions WHERE created_by = auth.uid())
  );