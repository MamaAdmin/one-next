ALTER TABLE public.kie_models
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT,
  ADD COLUMN IF NOT EXISTS strengths TEXT,
  ADD COLUMN IF NOT EXISTS use_cases TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS quality_tier TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS speed_tier TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS input_modalities TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS output_modalities TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS docs_url TEXT,
  ADD COLUMN IF NOT EXISTS recommended BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manuell',
  ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS kie_models_name_key ON public.kie_models (name);

ALTER TABLE public.whiteboard_videos
  ADD COLUMN IF NOT EXISTS image_model TEXT NOT NULL DEFAULT 'nano-banana-2',
  ADD COLUMN IF NOT EXISTS voice_model TEXT NOT NULL DEFAULT 'elevenlabs/text-to-speech-multilingual-v2',
  ADD COLUMN IF NOT EXISTS video_model TEXT NOT NULL DEFAULT 'veo3_fast';

CREATE TABLE IF NOT EXISTS public.model_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  applied_video_id UUID REFERENCES public.whiteboard_videos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.model_recommendations TO authenticated;
GRANT ALL ON public.model_recommendations TO service_role;
ALTER TABLE public.model_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins verwalten Empfehlungen"
  ON public.model_recommendations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Eigene Empfehlungen lesen"
  ON public.model_recommendations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_model_recommendations_updated_at
  BEFORE UPDATE ON public.model_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.kie_catalog_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'done',
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kie_catalog_sync_runs TO authenticated;
GRANT ALL ON public.kie_catalog_sync_runs TO service_role;
ALTER TABLE public.kie_catalog_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins verwalten Abgleiche"
  ON public.kie_catalog_sync_runs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_kie_catalog_sync_runs_updated_at
  BEFORE UPDATE ON public.kie_catalog_sync_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();