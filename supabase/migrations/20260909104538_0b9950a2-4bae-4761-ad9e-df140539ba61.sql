ALTER TABLE public.whiteboard_videos ADD COLUMN IF NOT EXISTS script_type text NOT NULL DEFAULT 'problem_loesung';
ALTER TABLE public.whiteboard_videos ALTER COLUMN style SET DEFAULT 'whiteboard';
UPDATE public.whiteboard_videos SET style = CASE
  WHEN style IN ('strichzeichnung','bunte_marker','bleistift','kreide') THEN 'whiteboard'
  WHEN style = 'comic' THEN 'character_2d'
  WHEN style = 'business_flat' THEN 'flat_2d'
  ELSE style END
WHERE style IN ('strichzeichnung','bunte_marker','bleistift','kreide','comic','business_flat');