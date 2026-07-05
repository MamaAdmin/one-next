-- Trigger: whenever a sprint is created, add its owner as a 'moderator' member.
CREATE OR REPLACE FUNCTION public.add_sprint_moderator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.sprint_members (sprint_id, user_id, email, rolle)
  VALUES (
    NEW.id,
    NEW.owner_id,
    (SELECT email FROM auth.users WHERE id = NEW.owner_id),
    'moderator'
  )
  ON CONFLICT (sprint_id, user_id) DO UPDATE SET rolle = 'moderator';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_add_sprint_moderator ON public.sprints;
CREATE TRIGGER trg_add_sprint_moderator
AFTER INSERT ON public.sprints
FOR EACH ROW
EXECUTE FUNCTION public.add_sprint_moderator();

-- Backfill: every existing sprint gets its owner as moderator (idempotent).
INSERT INTO public.sprint_members (sprint_id, user_id, email, rolle)
SELECT s.id, s.owner_id, u.email, 'moderator'
FROM public.sprints s
LEFT JOIN auth.users u ON u.id = s.owner_id
ON CONFLICT (sprint_id, user_id) DO UPDATE SET rolle = 'moderator'
WHERE public.sprint_members.rolle IN ('member', 'sprint_leader', 'viewer');
