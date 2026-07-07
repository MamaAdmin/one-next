
ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS sprints_deleted_at_idx ON public.sprints(deleted_at);

-- Owners/members should not see soft-deleted rows
DROP POLICY IF EXISTS "Owners read their sprints" ON public.sprints;
CREATE POLICY "Owners read their sprints"
  ON public.sprints FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (owner_id = auth.uid() OR is_sprint_member(id, auth.uid()))
  );
