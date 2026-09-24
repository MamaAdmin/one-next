CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  style text NOT NULL,
  format text NOT NULL DEFAULT '16:9' CHECK (format IN ('16:9','9:16')),
  language text NOT NULL DEFAULT 'de-CH',
  cost_limit_credits numeric NOT NULL DEFAULT 1000,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects owner or admin" ON public.projects FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  narration text NOT NULL DEFAULT '',
  image_prompt text NOT NULL DEFAULT '',
  overlay_texts jsonb NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds numeric NOT NULL DEFAULT 6,
  step_status jsonb NOT NULL DEFAULT '{"audio":"pending","image":"pending","video":"pending"}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX scenes_project_idx ON public.scenes(project_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scenes TO authenticated;
GRANT ALL ON public.scenes TO service_role;
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scenes via project" ON public.scenes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id uuid REFERENCES public.scenes(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('audio','image','video','avatar')),
  kie_task_id text,
  model text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed')),
  cost_credits numeric,
  storage_path text,
  error_message text,
  error_kind text,
  input_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  api text NOT NULL DEFAULT 'jobs',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX assets_scene_idx ON public.assets(scene_id);
CREATE INDEX assets_task_idx ON public.assets(kie_task_id);
GRANT SELECT ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets read" ON public.assets FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.scenes s JOIN public.projects p ON p.id = s.project_id
    WHERE s.id = scene_id AND p.user_id = auth.uid()));

CREATE TABLE public.style_model_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  style text NOT NULL,
  step text NOT NULL CHECK (step IN ('audio','image','video','avatar','avatar_fallback')),
  model_id text,
  api text NOT NULL DEFAULT 'jobs',
  default_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (style, step)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.style_model_config TO authenticated;
GRANT ALL ON public.style_model_config TO service_role;
ALTER TABLE public.style_model_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config read" ON public.style_model_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "config admin write" ON public.style_model_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER scenes_updated BEFORE UPDATE ON public.scenes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER assets_updated BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER smc_updated BEFORE UPDATE ON public.style_model_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.style_model_config (style, step, model_id, api, default_params, notes) VALUES
 ('flat_2d','audio','elevenlabs/text-to-dialogue-v3','jobs','{"voice":"Rachel"}','ElevenLabs V3'),
 ('flat_2d','image','nano-banana-pro','jobs','{"resolution":"2K","output_format":"png"}','Nano Banana Pro'),
 ('flat_2d','video','bytedance/seedance-2','jobs','{"resolution":"720p","_image_field":"first_frame_url"}','Seedance 2.0'),
 ('character_2d','audio','elevenlabs/text-to-dialogue-v3','jobs','{"voice":"Rachel"}','ElevenLabs V3'),
 ('character_2d','image','nano-banana-pro','jobs','{"resolution":"2K","output_format":"png","_reference_field":"image_input"}','Nano Banana Pro mit Figuren-Referenzbildern'),
 ('character_2d','video','kling-3.0-omni/image-to-video','jobs','{"_image_field":"image_urls"}','Kling O3 (3.0 Omni)'),
 ('iso_3d','audio','elevenlabs/text-to-dialogue-v3','jobs','{"voice":"Rachel"}','ElevenLabs V3'),
 ('iso_3d','image','seedream/5-pro-text-to-image','jobs','{}','Seedream 5.0 Pro'),
 ('iso_3d','video','veo3','veo','{"generationType":"FIRST_AND_LAST_FRAMES_2_VIDEO","_image_field":"imageUrls"}','Veo 3.1 (eigene Veo-Schnittstelle)'),
 ('whiteboard','audio','elevenlabs/text-to-dialogue-v3','jobs','{"voice":"Rachel"}','ElevenLabs V3'),
 ('whiteboard','image','gpt-image-2-text-to-image','jobs','{"_prompt_suffix":"Schwarze Strichzeichnung auf reinem weissem Hintergrund, keine Farben, keine Schattierungen, kein Text."}','GPT Image 2 – Strichzeichnung'),
 ('whiteboard','video',NULL,'code','{}','Kein Videomodell: Masken-Reveal von links nach rechts im Code'),
 ('motion_graphics','audio','elevenlabs/text-to-dialogue-v3','jobs','{"voice":"Rachel"}','ElevenLabs V3'),
 ('motion_graphics','image','gpt-image-2-5-sunburst-text-to-image','jobs','{}','GPT Image 2.5 für Illustrationen'),
 ('motion_graphics','video',NULL,'code','{}','Diagramme, Zahlen und Bewegung im Code'),
 ('kinetic_typography','audio','elevenlabs/text-to-dialogue-v3','jobs','{"voice":"Rachel"}','ElevenLabs V3'),
 ('kinetic_typography','image','gpt-image-2-5-sunburst-text-to-image','jobs','{}','Optional: nur Hintergrundbilder'),
 ('kinetic_typography','video',NULL,'code','{}','Vollständig im Code'),
 ('screencast','audio','elevenlabs/text-to-dialogue-v3','jobs','{"voice":"Rachel"}','ElevenLabs V3'),
 ('screencast','image',NULL,'upload','{}','Bildschirmaufnahme wird hochgeladen'),
 ('screencast','video',NULL,'code','{}','Keine Videogenerierung: Zoom und Overlays im Code'),
 ('avatar','audio','elevenlabs/text-to-dialogue-v3','jobs','{"voice":"Rachel"}','ElevenLabs V3'),
 ('avatar','image','nano-banana-pro','jobs','{"resolution":"2K","output_format":"png"}','Porträt (oder Upload)'),
 ('avatar','avatar','kling/ai-avatar-pro','jobs','{}','Kling AI Avatar (Pro)'),
 ('avatar','avatar_fallback','omnihuman-1-5','jobs','{}','OmniHuman 1.5 als Ausweichmodell');

CREATE POLICY "lernvideo assets admin read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'lernvideo-assets' AND public.has_role(auth.uid(),'admin'));