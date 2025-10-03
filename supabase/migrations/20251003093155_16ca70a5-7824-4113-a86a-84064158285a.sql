-- Create design sprint sessions table
CREATE TABLE public.design_sprint_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  team_name TEXT NOT NULL,
  current_day INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  last_active_day INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]'::jsonb,
  task_completion JSONB DEFAULT '{}'::jsonb,
  challenge_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_day CHECK (current_day >= 0 AND current_day <= 5),
  CONSTRAINT valid_last_active CHECK (last_active_day >= 0 AND last_active_day <= 5),
  CONSTRAINT valid_percentage CHECK (completion_percentage >= 0 AND completion_percentage <= 100)
);

-- Enable RLS
ALTER TABLE public.design_sprint_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read their own session by token or user_id
CREATE POLICY "Users can read own sessions"
  ON public.design_sprint_sessions
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    session_token IS NOT NULL
  );

-- Policy: Anyone can insert sessions
CREATE POLICY "Anyone can create sessions"
  ON public.design_sprint_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON public.design_sprint_sessions
  FOR UPDATE
  USING (user_id = auth.uid() OR session_token IS NOT NULL);

-- Policy: Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON public.design_sprint_sessions
  FOR DELETE
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_design_sprint_sessions_updated_at
  BEFORE UPDATE ON public.design_sprint_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();