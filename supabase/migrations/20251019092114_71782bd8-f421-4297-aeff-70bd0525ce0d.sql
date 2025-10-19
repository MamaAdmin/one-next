-- Add category column to lms_course_modules
ALTER TABLE lms_course_modules ADD COLUMN category text;

-- Map existing phase numbers to categories
UPDATE lms_course_modules 
SET category = CASE 
  WHEN phase_number = 1 THEN 'understand'
  WHEN phase_number = 2 THEN 'ideate'
  WHEN phase_number = 3 THEN 'decide'
  WHEN phase_number = 4 THEN 'prototype'
  WHEN phase_number = 5 THEN 'validate'
  ELSE 'retrospect'
END;

-- Set default and NOT NULL constraint
ALTER TABLE lms_course_modules 
  ALTER COLUMN category SET DEFAULT 'understand',
  ALTER COLUMN category SET NOT NULL;

-- Drop old phase_number column
ALTER TABLE lms_course_modules DROP COLUMN phase_number;

-- Add current_category column to lms_course_enrollments
ALTER TABLE lms_course_enrollments ADD COLUMN current_category text DEFAULT 'understand';

-- Map existing current_phase to categories
UPDATE lms_course_enrollments 
SET current_category = CASE 
  WHEN current_phase = 1 THEN 'understand'
  WHEN current_phase = 2 THEN 'ideate'
  WHEN current_phase = 3 THEN 'decide'
  WHEN current_phase = 4 THEN 'prototype'
  WHEN current_phase >= 5 THEN 'validate'
  ELSE 'understand'
END;

-- Set NOT NULL constraint
ALTER TABLE lms_course_enrollments 
  ALTER COLUMN current_category SET NOT NULL;

-- Drop old current_phase column
ALTER TABLE lms_course_enrollments DROP COLUMN current_phase;

-- Update calculate_enrollment_progress function to use categories
CREATE OR REPLACE FUNCTION public.calculate_enrollment_progress(p_enrollment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_total_modules int;
  v_completed_modules int;
  v_progress_pct int;
  v_current_category text;
BEGIN
  -- Get total modules for this enrollment's course
  SELECT COUNT(*) INTO v_total_modules
  FROM lms_course_modules m
  WHERE m.course_id = (
    SELECT p.course_id 
    FROM lms_course_enrollments e
    JOIN lms_course_purchases p ON e.purchase_id = p.id
    WHERE e.id = p_enrollment_id
  );

  -- Count completed modules
  SELECT COUNT(*) INTO v_completed_modules
  FROM lms_module_progress
  WHERE enrollment_id = p_enrollment_id
    AND is_completed = true;

  -- Calculate percentage
  IF v_total_modules > 0 THEN
    v_progress_pct := (v_completed_modules * 100) / v_total_modules;
  ELSE
    v_progress_pct := 0;
  END IF;

  -- Get the category of the most recently completed module
  SELECT COALESCE(m.category, 'understand') INTO v_current_category
  FROM lms_module_progress mp
  JOIN lms_course_modules m ON mp.module_id = m.id
  WHERE mp.enrollment_id = p_enrollment_id
    AND mp.is_completed = true
  ORDER BY mp.completed_at DESC
  LIMIT 1;

  -- Update enrollment
  UPDATE lms_course_enrollments
  SET 
    progress_percentage = v_progress_pct,
    current_category = COALESCE(v_current_category, current_category),
    updated_at = now()
  WHERE id = p_enrollment_id;
END;
$function$;

-- Update check_first_phase_achievement trigger function to use categories
CREATE OR REPLACE FUNCTION public.check_first_phase_achievement()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.current_category IN ('ideate', 'decide', 'prototype', 'validate', 'retrospect') 
     AND (OLD.current_category IS NULL OR OLD.current_category = 'understand') THEN
    INSERT INTO lms_achievements (participant_id, achievement_type)
    VALUES (NEW.participant_id, 'first_phase')
    ON CONFLICT (participant_id, achievement_type) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update check_all_phases_achievement trigger function to use categories
CREATE OR REPLACE FUNCTION public.check_all_phases_achievement()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.current_category = 'retrospect' AND NEW.progress_percentage >= 100 THEN
    INSERT INTO lms_achievements (participant_id, achievement_type)
    VALUES (NEW.participant_id, 'all_phases')
    ON CONFLICT (participant_id, achievement_type) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;