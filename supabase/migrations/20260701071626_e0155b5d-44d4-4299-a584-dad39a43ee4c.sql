
-- Framing sessions
CREATE TABLE public.framing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  titel_arbeitstitel text NOT NULL DEFAULT '',
  kontext text NOT NULL DEFAULT '',
  current_step int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','done','archived')),
  challenge_statement text,
  resulting_sprint_id uuid REFERENCES public.sprints(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.framing_sessions TO authenticated;
GRANT ALL ON public.framing_sessions TO service_role;

ALTER TABLE public.framing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own framing sessions"
  ON public.framing_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins can view all framing sessions"
  ON public.framing_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER framing_sessions_updated_at
  BEFORE UPDATE ON public.framing_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Framing steps
CREATE TABLE public.framing_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.framing_sessions(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, step_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.framing_steps TO authenticated;
GRANT ALL ON public.framing_steps TO service_role;

ALTER TABLE public.framing_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own framing steps"
  ON public.framing_steps FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.framing_sessions s
    WHERE s.id = framing_steps.session_id AND s.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.framing_sessions s
    WHERE s.id = framing_steps.session_id AND s.owner_id = auth.uid()
  ));

CREATE POLICY "Admins can view all framing steps"
  ON public.framing_steps FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER framing_steps_updated_at
  BEFORE UPDATE ON public.framing_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_framing_steps_session ON public.framing_steps(session_id);
CREATE INDEX idx_framing_sessions_owner ON public.framing_sessions(owner_id);
