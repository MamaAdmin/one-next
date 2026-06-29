
-- Lock down helper to authenticated only
REVOKE EXECUTE ON FUNCTION public.is_sprint_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_sprint_member(uuid, uuid) TO authenticated, service_role;

-- Storage policies for sprint-assets
-- Convention: files stored under "<sprint_id>/<...>"
CREATE POLICY "Sprint members read sprint-assets"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'sprint-assets'
    AND EXISTS (
      SELECT 1 FROM public.sprints s
      WHERE s.id::text = split_part(name, '/', 1)
        AND (s.owner_id = auth.uid() OR public.is_sprint_member(s.id, auth.uid()))
    )
  );

CREATE POLICY "Sprint members upload sprint-assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'sprint-assets'
    AND EXISTS (
      SELECT 1 FROM public.sprints s
      WHERE s.id::text = split_part(name, '/', 1)
        AND (s.owner_id = auth.uid() OR public.is_sprint_member(s.id, auth.uid()))
    )
  );

CREATE POLICY "Sprint members update sprint-assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'sprint-assets'
    AND EXISTS (
      SELECT 1 FROM public.sprints s
      WHERE s.id::text = split_part(name, '/', 1)
        AND (s.owner_id = auth.uid() OR public.is_sprint_member(s.id, auth.uid()))
    )
  );

CREATE POLICY "Sprint owners delete sprint-assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'sprint-assets'
    AND EXISTS (
      SELECT 1 FROM public.sprints s
      WHERE s.id::text = split_part(name, '/', 1)
        AND s.owner_id = auth.uid()
    )
  );
