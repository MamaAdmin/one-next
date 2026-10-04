CREATE TABLE public.image_prompt_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  prompt text NOT NULL,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.image_prompt_library TO authenticated;
GRANT ALL ON public.image_prompt_library TO service_role;
ALTER TABLE public.image_prompt_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Editors manage prompt library" ON public.image_prompt_library FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'content_manager'));