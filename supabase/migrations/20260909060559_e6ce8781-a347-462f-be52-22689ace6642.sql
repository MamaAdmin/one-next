ALTER TABLE public.kie_models DROP CONSTRAINT IF EXISTS kie_models_category_check;
ALTER TABLE public.kie_models ADD CONSTRAINT kie_models_category_check
  CHECK (category IN ('text','image','voice','video','music'));