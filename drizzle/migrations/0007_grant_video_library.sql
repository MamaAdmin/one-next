GRANT SELECT ON public.video_library TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_library TO authenticated;
GRANT ALL ON public.video_library TO service_role;