
DROP POLICY IF EXISTS "Admins update all sprints" ON public.sprints;
CREATE POLICY "Admins update all sprints"
  ON public.sprints FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
