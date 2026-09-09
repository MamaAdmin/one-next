
ALTER TABLE public.whiteboard_videos ADD COLUMN IF NOT EXISTS style text NOT NULL DEFAULT 'strichzeichnung';

CREATE TABLE public.kie_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('text','image','voice','video')),
  unit text NOT NULL CHECK (unit IN ('job','image','1k_chars','second')),
  credits_per_unit numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kie_models TO authenticated;
GRANT ALL ON public.kie_models TO service_role;
ALTER TABLE public.kie_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage kie models" ON public.kie_models FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_kie_models_updated_at BEFORE UPDATE ON public.kie_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.kie_models (name, category, unit, credits_per_unit) VALUES
  ('gpt-5-2','text','job',1),
  ('nano-banana-2','image','image',4),
  ('elevenlabs/text-to-speech-multilingual-v2','voice','1k_chars',2),
  ('veo3_fast','video','second',20)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE public.generation_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES public.whiteboard_videos(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'running',
  script_model text,
  image_model text,
  voice_model text,
  video_model text,
  number_of_sections integer NOT NULL DEFAULT 0,
  number_of_images integer NOT NULL DEFAULT 0,
  audio_characters integer NOT NULL DEFAULT 0,
  video_seconds numeric NOT NULL DEFAULT 0,
  credits_before numeric,
  credits_after numeric,
  estimated_credits numeric NOT NULL DEFAULT 0,
  credits_used numeric,
  error_message text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generation_usage TO authenticated;
GRANT ALL ON public.generation_usage TO service_role;
ALTER TABLE public.generation_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage generation usage" ON public.generation_usage FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_generation_usage_updated_at BEFORE UPDATE ON public.generation_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_id uuid REFERENCES public.generation_usage(id) ON DELETE CASCADE,
  video_id uuid REFERENCES public.whiteboard_videos(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('script','image','voice','video')),
  task_id text,
  model text,
  units numeric NOT NULL DEFAULT 0,
  estimated_credits numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'running',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generation_jobs TO authenticated;
GRANT ALL ON public.generation_jobs TO service_role;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage generation jobs" ON public.generation_jobs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_generation_jobs_updated_at BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
