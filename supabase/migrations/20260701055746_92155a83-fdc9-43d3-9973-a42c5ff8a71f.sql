
CREATE POLICY "Admins read all sprints"
ON public.sprints FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read all sprint steps"
ON public.sprint_steps FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read all sprint members"
ON public.sprint_members FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
