
-- Members
CREATE TABLE public.framing_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.framing_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rolle text NOT NULL CHECK (rolle IN ('viewer','editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.framing_members TO authenticated;
GRANT ALL ON public.framing_members TO service_role;
ALTER TABLE public.framing_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage framing members"
  ON public.framing_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.framing_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.framing_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid()));

CREATE POLICY "Members read their framing membership"
  ON public.framing_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins read all framing members"
  ON public.framing_members FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Invitations
CREATE TABLE public.framing_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.framing_sessions(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'base64'),
  role text NOT NULL CHECK (role IN ('viewer','editor')),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked boolean NOT NULL DEFAULT false
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.framing_invitations TO authenticated;
GRANT ALL ON public.framing_invitations TO service_role;
ALTER TABLE public.framing_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage framing invitations"
  ON public.framing_invitations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.framing_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.framing_sessions s WHERE s.id = session_id AND s.owner_id = auth.uid()));

CREATE POLICY "Admins read framing invitations"
  ON public.framing_invitations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Helpers
CREATE OR REPLACE FUNCTION public.is_framing_member(_session_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.framing_members WHERE session_id = _session_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.can_edit_framing(_session_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.framing_sessions s WHERE s.id = _session_id AND s.owner_id = _user_id)
      OR EXISTS (SELECT 1 FROM public.framing_members m WHERE m.session_id = _session_id AND m.user_id = _user_id AND m.rolle <> 'viewer');
$$;

-- Redeem
CREATE OR REPLACE FUNCTION public.redeem_framing_invitation(p_token text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_invite public.framing_invitations%ROWTYPE;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO v_invite FROM public.framing_invitations WHERE token = p_token;
  IF NOT FOUND OR v_invite.revoked OR (v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now()) THEN
    RAISE EXCEPTION 'Invitation invalid or expired';
  END IF;
  IF EXISTS (SELECT 1 FROM public.framing_sessions s WHERE s.id = v_invite.session_id AND s.owner_id = v_uid) THEN
    RETURN v_invite.session_id;
  END IF;
  INSERT INTO public.framing_members (session_id, user_id, rolle)
  VALUES (v_invite.session_id, v_uid, v_invite.role)
  ON CONFLICT (session_id, user_id) DO UPDATE
    SET rolle = CASE WHEN framing_members.rolle = 'viewer' AND EXCLUDED.rolle = 'editor'
                     THEN 'editor' ELSE framing_members.rolle END;
  RETURN v_invite.session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_framing_invitation(text) TO authenticated;

-- Update framing_sessions policies: allow members to read
DROP POLICY IF EXISTS "Owners manage own framing sessions" ON public.framing_sessions;

CREATE POLICY "Owners insert framing sessions"
  ON public.framing_sessions FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner or members read framing sessions"
  ON public.framing_sessions FOR SELECT
  USING (auth.uid() = owner_id OR public.is_framing_member(id, auth.uid()));

CREATE POLICY "Owner or editors update framing sessions"
  ON public.framing_sessions FOR UPDATE
  USING (public.can_edit_framing(id, auth.uid()))
  WITH CHECK (public.can_edit_framing(id, auth.uid()));

CREATE POLICY "Owners delete framing sessions"
  ON public.framing_sessions FOR DELETE
  USING (auth.uid() = owner_id);

-- Update framing_steps policies
DROP POLICY IF EXISTS "Owners manage own framing steps" ON public.framing_steps;

CREATE POLICY "Owner or members read framing steps"
  ON public.framing_steps FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.framing_sessions s
                 WHERE s.id = framing_steps.session_id
                 AND (s.owner_id = auth.uid() OR public.is_framing_member(s.id, auth.uid()))));

CREATE POLICY "Editors write framing steps"
  ON public.framing_steps FOR INSERT
  WITH CHECK (public.can_edit_framing(session_id, auth.uid()));

CREATE POLICY "Editors update framing steps"
  ON public.framing_steps FOR UPDATE
  USING (public.can_edit_framing(session_id, auth.uid()))
  WITH CHECK (public.can_edit_framing(session_id, auth.uid()));

CREATE POLICY "Owners delete framing steps"
  ON public.framing_steps FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.framing_sessions s
                 WHERE s.id = framing_steps.session_id AND s.owner_id = auth.uid()));
