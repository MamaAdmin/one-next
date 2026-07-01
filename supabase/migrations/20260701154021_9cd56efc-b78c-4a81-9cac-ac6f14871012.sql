
-- Sprint invitations table
CREATE TABLE public.sprint_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'base64'),
  role text NOT NULL CHECK (role IN ('viewer','editor')),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked boolean NOT NULL DEFAULT false
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sprint_invitations TO authenticated;
GRANT ALL ON public.sprint_invitations TO service_role;

ALTER TABLE public.sprint_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage invitations"
  ON public.sprint_invitations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.sprints s WHERE s.id = sprint_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.sprints s WHERE s.id = sprint_id AND s.owner_id = auth.uid()));

CREATE POLICY "Admins read invitations"
  ON public.sprint_invitations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Redeem function: takes token, adds current user as sprint_member with role
CREATE OR REPLACE FUNCTION public.redeem_sprint_invitation(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.sprint_invitations%ROWTYPE;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_invite FROM public.sprint_invitations WHERE token = p_token;
  IF NOT FOUND OR v_invite.revoked OR (v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now()) THEN
    RAISE EXCEPTION 'Invitation invalid or expired';
  END IF;

  -- Skip if owner
  IF EXISTS (SELECT 1 FROM public.sprints s WHERE s.id = v_invite.sprint_id AND s.owner_id = v_uid) THEN
    RETURN v_invite.sprint_id;
  END IF;

  INSERT INTO public.sprint_members (sprint_id, user_id, rolle)
  VALUES (v_invite.sprint_id, v_uid, v_invite.role)
  ON CONFLICT DO NOTHING;

  -- Upgrade role if existing member had a lower one
  UPDATE public.sprint_members
  SET rolle = v_invite.role
  WHERE sprint_id = v_invite.sprint_id
    AND user_id = v_uid
    AND rolle = 'viewer'
    AND v_invite.role = 'editor';

  RETURN v_invite.sprint_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_sprint_invitation(text) TO authenticated;

-- Helper: can current user edit this sprint?
CREATE OR REPLACE FUNCTION public.can_edit_sprint(_sprint_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sprints s WHERE s.id = _sprint_id AND s.owner_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.sprint_members m
    WHERE m.sprint_id = _sprint_id AND m.user_id = _user_id AND m.rolle <> 'viewer'
  );
$$;

-- Tighten sprint_steps write policies: viewers may read but not write
DROP POLICY IF EXISTS "Members update steps" ON public.sprint_steps;
DROP POLICY IF EXISTS "Members write steps" ON public.sprint_steps;

CREATE POLICY "Editors update steps"
  ON public.sprint_steps FOR UPDATE
  USING (public.can_edit_sprint(sprint_id, auth.uid()))
  WITH CHECK (public.can_edit_sprint(sprint_id, auth.uid()));

CREATE POLICY "Editors insert steps"
  ON public.sprint_steps FOR INSERT
  WITH CHECK (public.can_edit_sprint(sprint_id, auth.uid()));
