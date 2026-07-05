
-- 1. sprints: Solo → Team migrieren, CHECK anpassen, kickoff_confirmed_at hinzufügen
UPDATE public.sprints SET modus = 'team' WHERE modus = 'solo';

ALTER TABLE public.sprints DROP CONSTRAINT IF EXISTS sprints_modus_check;
ALTER TABLE public.sprints
  ALTER COLUMN modus SET DEFAULT 'team',
  ADD CONSTRAINT sprints_modus_check CHECK (modus = 'team');

ALTER TABLE public.sprints
  ADD COLUMN IF NOT EXISTS kickoff_confirmed_at timestamptz;

-- Bestehende Sprints, die bereits über 1.1 hinaus sind, gelten als kickoff-bestätigt
UPDATE public.sprints
SET kickoff_confirmed_at = updated_at
WHERE kickoff_confirmed_at IS NULL
  AND current_step <> '1.1';

-- 2. Neue Tabelle sprint_invitations
CREATE TABLE IF NOT EXISTS public.sprint_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role_type text NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  invited_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  CONSTRAINT sprint_invitations_status_check CHECK (status IN ('pending','accepted','revoked','expired')),
  CONSTRAINT sprint_invitations_role_check CHECK (role_type IN ('decider','sprint_leader','finance','marketing','customer','tech','design','wildcard','viewer'))
);

CREATE INDEX IF NOT EXISTS sprint_invitations_sprint_idx ON public.sprint_invitations(sprint_id);
CREATE INDEX IF NOT EXISTS sprint_invitations_token_idx ON public.sprint_invitations(token);
CREATE INDEX IF NOT EXISTS sprint_invitations_email_idx ON public.sprint_invitations(email);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sprint_invitations TO authenticated;
GRANT ALL ON public.sprint_invitations TO service_role;

ALTER TABLE public.sprint_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage sprint invitations"
ON public.sprint_invitations
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.sprints s WHERE s.id = sprint_invitations.sprint_id AND s.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.sprints s WHERE s.id = sprint_invitations.sprint_id AND s.owner_id = auth.uid()));

CREATE POLICY "Admins read sprint invitations"
ON public.sprint_invitations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. SECURITY DEFINER Function für Token-Lookup (analog bmad_invitations)
CREATE OR REPLACE FUNCTION public.get_sprint_invitation_by_token(p_token text)
RETURNS TABLE (
  id uuid,
  sprint_id uuid,
  sprint_title text,
  email text,
  full_name text,
  role_type text,
  status text,
  expires_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.sprint_id, s.titel, i.email, i.full_name, i.role_type, i.status, i.expires_at
  FROM public.sprint_invitations i
  JOIN public.sprints s ON s.id = i.sprint_id
  WHERE i.token = p_token
  LIMIT 1;
$$;
