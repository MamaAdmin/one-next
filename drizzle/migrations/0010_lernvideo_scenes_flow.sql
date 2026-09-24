ALTER TABLE public.projects
  ADD COLUMN topic text NOT NULL DEFAULT '',
  ADD COLUMN audience text NOT NULL DEFAULT '',
  ADD COLUMN learning_goal text NOT NULL DEFAULT '',
  ADD COLUMN target_seconds integer NOT NULL DEFAULT 90 CHECK (target_seconds IN (60,90,120)),
  ADD COLUMN voice text NOT NULL DEFAULT 'Rachel',
  ADD COLUMN reference_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN characters jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN pronunciation jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN portrait_path text;

ALTER TABLE public.scenes ADD COLUMN audio_seconds numeric;

ALTER TABLE public.style_model_config ADD COLUMN est_credits numeric NOT NULL DEFAULT 0;

UPDATE public.style_model_config SET style = 'isometric_3d' WHERE style = 'iso_3d';
UPDATE public.style_model_config SET style = 'kinetic_typo' WHERE style = 'kinetic_typography';
INSERT INTO public.style_model_config (style, step, model_id, api, default_params, notes)
  SELECT 'infografik', step, model_id, api, default_params, notes FROM public.style_model_config WHERE style = 'motion_graphics';
INSERT INTO public.style_model_config (style, step, model_id, api, default_params, notes)
  SELECT 'screencast_plus', step, model_id, api, default_params, notes FROM public.style_model_config WHERE style = 'screencast';

UPDATE public.style_model_config SET est_credits = 3 WHERE step = 'audio';
UPDATE public.style_model_config SET est_credits = 18 WHERE step = 'image' AND model_id = 'nano-banana-pro';
UPDATE public.style_model_config SET est_credits = 6 WHERE step = 'image' AND model_id LIKE 'gpt-image%';
UPDATE public.style_model_config SET est_credits = 8 WHERE step = 'image' AND model_id LIKE 'seedream%';
UPDATE public.style_model_config SET est_credits = 100, default_params = default_params || '{"_duration_min":4,"_duration_max":15}'::jsonb WHERE model_id = 'bytedance/seedance-2';
UPDATE public.style_model_config SET est_credits = 120, default_params = default_params || '{"_duration_min":3,"_duration_max":15}'::jsonb WHERE model_id = 'kling-3.0-omni/image-to-video';
UPDATE public.style_model_config SET est_credits = 150, default_params = default_params || '{"_fixed_duration":8}'::jsonb WHERE model_id = 'veo3';
UPDATE public.style_model_config SET est_credits = 150 WHERE step IN ('avatar','avatar_fallback');

CREATE POLICY "lernvideo assets admin write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lernvideo-assets' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "lernvideo assets admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'lernvideo-assets' AND public.has_role(auth.uid(),'admin'));