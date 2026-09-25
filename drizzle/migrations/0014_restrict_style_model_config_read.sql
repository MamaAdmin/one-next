DROP POLICY IF EXISTS "config read" ON public.style_model_config;
CREATE POLICY "config read" ON public.style_model_config FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'content_manager'::app_role));