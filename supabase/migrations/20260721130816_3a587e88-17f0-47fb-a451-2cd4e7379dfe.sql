
-- Miro OAuth connection per user
CREATE TABLE public.miro_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  miro_user_id text,
  miro_team_id text,
  miro_name text,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  scope text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.miro_connections TO authenticated;
GRANT ALL ON public.miro_connections TO service_role;

ALTER TABLE public.miro_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own miro connection"
  ON public.miro_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own miro connection"
  ON public.miro_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own miro connection"
  ON public.miro_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own miro connection"
  ON public.miro_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_miro_connections_updated_at
  BEFORE UPDATE ON public.miro_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Miro board per sprint step
CREATE TABLE public.sprint_miro_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  board_id text NOT NULL,
  board_url text NOT NULL,
  embed_url text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sprint_id, step_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sprint_miro_boards TO authenticated;
GRANT ALL ON public.sprint_miro_boards TO service_role;

ALTER TABLE public.sprint_miro_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sprint members read miro boards"
  ON public.sprint_miro_boards FOR SELECT
  TO authenticated
  USING (
    public.is_sprint_member(sprint_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.sprints s WHERE s.id = sprint_id AND s.owner_id = auth.uid())
  );

CREATE POLICY "Sprint editors insert miro boards"
  ON public.sprint_miro_boards FOR INSERT
  TO authenticated
  WITH CHECK (public.can_edit_sprint(sprint_id, auth.uid()));

CREATE POLICY "Sprint editors update miro boards"
  ON public.sprint_miro_boards FOR UPDATE
  TO authenticated
  USING (public.can_edit_sprint(sprint_id, auth.uid()))
  WITH CHECK (public.can_edit_sprint(sprint_id, auth.uid()));

CREATE POLICY "Sprint editors delete miro boards"
  ON public.sprint_miro_boards FOR DELETE
  TO authenticated
  USING (public.can_edit_sprint(sprint_id, auth.uid()));

CREATE TRIGGER update_sprint_miro_boards_updated_at
  BEFORE UPDATE ON public.sprint_miro_boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
