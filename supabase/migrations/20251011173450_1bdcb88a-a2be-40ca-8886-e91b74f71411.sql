-- Phase 1: Create calculate_enrollment_progress RPC function
CREATE OR REPLACE FUNCTION calculate_enrollment_progress(p_enrollment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_modules int;
  v_completed_modules int;
  v_progress_pct int;
  v_max_phase int;
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

  -- Calculate current phase (max phase of completed modules)
  SELECT COALESCE(MAX(m.phase_number), 1) INTO v_max_phase
  FROM lms_module_progress mp
  JOIN lms_course_modules m ON mp.module_id = m.id
  WHERE mp.enrollment_id = p_enrollment_id
    AND mp.is_completed = true;

  -- Update enrollment
  UPDATE lms_course_enrollments
  SET 
    progress_percentage = v_progress_pct,
    current_phase = GREATEST(current_phase, v_max_phase),
    updated_at = now()
  WHERE id = p_enrollment_id;
END;
$$;