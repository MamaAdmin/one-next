
-- =========================
-- Tables first (no cross-refs in policies yet)
-- =========================
CREATE TABLE public.sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titel text NOT NULL,
  problemstellung text NOT NULL DEFAULT '',
  modus text NOT NULL DEFAULT 'solo' CHECK (modus IN ('solo','team')),
  decider text NOT NULL DEFAULT '',
  sprint_leader text NOT NULL DEFAULT '',
  current_step text NOT NULL DEFAULT '1.1',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','done','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sprint_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  rolle text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sprint_id, user_id)
);

CREATE TABLE public.sprint_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sprint_id, step_key)
);

-- =========================
-- GRANTs
-- =========================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sprints        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sprint_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sprint_steps   TO authenticated;
GRANT ALL ON public.sprints        TO service_role;
GRANT ALL ON public.sprint_members TO service_role;
GRANT ALL ON public.sprint_steps   TO service_role;

-- =========================
-- Helper (security definer; safe now that table exists)
-- =========================
CREATE OR REPLACE FUNCTION public.is_sprint_member(_sprint_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sprint_members
    WHERE sprint_id = _sprint_id AND user_id = _user_id
  );
$$;

-- =========================
-- RLS
-- =========================
ALTER TABLE public.sprints        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprint_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprint_steps   ENABLE ROW LEVEL SECURITY;

-- sprints
CREATE POLICY "Owners read their sprints"
  ON public.sprints FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_sprint_member(id, auth.uid()));

CREATE POLICY "Owners insert their sprints"
  ON public.sprints FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners update their sprints"
  ON public.sprints FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners delete their sprints"
  ON public.sprints FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- sprint_members
CREATE POLICY "Members read membership of own sprints"
  ON public.sprint_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.sprints s WHERE s.id = sprint_id AND s.owner_id = auth.uid())
  );

CREATE POLICY "Owners manage members"
  ON public.sprint_members FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sprints s WHERE s.id = sprint_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.sprints s WHERE s.id = sprint_id AND s.owner_id = auth.uid()));

-- sprint_steps
CREATE POLICY "Members read steps"
  ON public.sprint_steps FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sprints s
      WHERE s.id = sprint_id
        AND (s.owner_id = auth.uid() OR public.is_sprint_member(s.id, auth.uid()))
    )
  );

CREATE POLICY "Members write steps"
  ON public.sprint_steps FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sprints s
      WHERE s.id = sprint_id
        AND (s.owner_id = auth.uid() OR public.is_sprint_member(s.id, auth.uid()))
    )
  );

CREATE POLICY "Members update steps"
  ON public.sprint_steps FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sprints s
      WHERE s.id = sprint_id
        AND (s.owner_id = auth.uid() OR public.is_sprint_member(s.id, auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sprints s
      WHERE s.id = sprint_id
        AND (s.owner_id = auth.uid() OR public.is_sprint_member(s.id, auth.uid()))
    )
  );

CREATE POLICY "Owners delete steps"
  ON public.sprint_steps FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.sprints s WHERE s.id = sprint_id AND s.owner_id = auth.uid())
  );

-- =========================
-- Indexes & triggers
-- =========================
CREATE INDEX sprints_owner_idx         ON public.sprints(owner_id);
CREATE INDEX sprint_members_sprint_idx ON public.sprint_members(sprint_id);
CREATE INDEX sprint_members_user_idx   ON public.sprint_members(user_id);
CREATE INDEX sprint_steps_sprint_idx   ON public.sprint_steps(sprint_id);

CREATE TRIGGER sprints_set_updated_at
  BEFORE UPDATE ON public.sprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER sprint_steps_set_updated_at
  BEFORE UPDATE ON public.sprint_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
