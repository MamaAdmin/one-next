ALTER TABLE public.bmad_sessions
  ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS framing_session_id UUID REFERENCES public.framing_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS bmad_sessions_sprint_id_idx ON public.bmad_sessions (sprint_id);
CREATE INDEX IF NOT EXISTS bmad_sessions_framing_session_id_idx ON public.bmad_sessions (framing_session_id);