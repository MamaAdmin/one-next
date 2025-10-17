-- BMAD Method Implementation - Database Schema

-- 1. Create Enums
CREATE TYPE bmad_agent_type AS ENUM (
  'business_analyst',
  'product_manager', 
  'ux_expert',
  'product_owner',
  'architect',
  'scrum_master'
);

CREATE TYPE bmad_session_status AS ENUM (
  'planning',
  'development',
  'completed',
  'archived'
);

CREATE TYPE bmad_artifact_type AS ENUM (
  'business_requirements',
  'product_vision',
  'ux_wireframes',
  'user_stories',
  'technical_architecture',
  'sprint_plan',
  'story_file',
  'flattened_repo'
);

-- 2. BMAD Sessions Table
CREATE TABLE public.bmad_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  title TEXT NOT NULL,
  description TEXT,
  project_context TEXT,
  status bmad_session_status NOT NULL DEFAULT 'planning',
  
  created_by UUID NOT NULL,
  
  current_phase TEXT NOT NULL DEFAULT 'business_analyst',
  planning_completed_at TIMESTAMP WITH TIME ZONE,
  development_started_at TIMESTAMP WITH TIME ZONE,
  
  settings JSONB DEFAULT '{
    "auto_progress": false,
    "require_approval": false,
    "ai_model": "google/gemini-2.5-flash"
  }'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bmad_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all sessions"
  ON public.bmad_sessions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 3. BMAD Artifacts Table
CREATE TABLE public.bmad_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.bmad_sessions(id) ON DELETE CASCADE NOT NULL,
  
  agent_type bmad_agent_type NOT NULL,
  artifact_type bmad_artifact_type NOT NULL,
  title TEXT NOT NULL,
  
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  version INTEGER NOT NULL DEFAULT 1,
  parent_artifact_id UUID REFERENCES public.bmad_artifacts(id),
  
  is_approved BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bmad_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all artifacts"
  ON public.bmad_artifacts FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_bmad_artifacts_session ON public.bmad_artifacts(session_id);
CREATE INDEX idx_bmad_artifacts_agent ON public.bmad_artifacts(agent_type);

-- 4. BMAD Conversations Table
CREATE TABLE public.bmad_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.bmad_sessions(id) ON DELETE CASCADE NOT NULL,
  agent_type bmad_agent_type NOT NULL,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bmad_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all conversations"
  ON public.bmad_conversations FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert conversations"
  ON public.bmad_conversations FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_bmad_conversations_session ON public.bmad_conversations(session_id, created_at DESC);

-- 5. Update trigger for bmad_sessions
CREATE TRIGGER update_bmad_sessions_updated_at
  BEFORE UPDATE ON public.bmad_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bmad_artifacts_updated_at
  BEFORE UPDATE ON public.bmad_artifacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();