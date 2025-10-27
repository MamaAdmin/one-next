-- Extend calculate_enrollment_progress to include quiz completion
CREATE OR REPLACE FUNCTION public.calculate_enrollment_progress(p_enrollment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_modules int;
  v_completed_modules int;
  v_total_quizzes int;
  v_passed_quizzes int;
  v_total_items int;
  v_completed_items int;
  v_progress_pct int;
  v_current_category text;
  v_course_id uuid;
BEGIN
  -- Get course_id for this enrollment
  SELECT p.course_id INTO v_course_id
  FROM lms_course_enrollments e
  JOIN lms_course_purchases p ON e.purchase_id = p.id
  WHERE e.id = p_enrollment_id;

  -- Get total modules for this course
  SELECT COUNT(*) INTO v_total_modules
  FROM lms_course_modules
  WHERE course_id = v_course_id;

  -- Count completed modules
  SELECT COUNT(*) INTO v_completed_modules
  FROM lms_module_progress
  WHERE enrollment_id = p_enrollment_id
    AND is_completed = true;

  -- Get total quizzes for this course
  SELECT COUNT(*) INTO v_total_quizzes
  FROM lms_quizzes q
  JOIN lms_course_modules m ON q.module_id = m.id
  WHERE m.course_id = v_course_id;

  -- Count passed quizzes for this enrollment
  SELECT COUNT(DISTINCT q.id) INTO v_passed_quizzes
  FROM lms_quizzes q
  JOIN lms_course_modules m ON q.module_id = m.id
  JOIN lms_quiz_attempts qa ON q.id = qa.quiz_id
  WHERE m.course_id = v_course_id
    AND qa.enrollment_id = p_enrollment_id
    AND qa.is_passed = true;

  -- Calculate total items and completed items
  v_total_items := v_total_modules + v_total_quizzes;
  v_completed_items := v_completed_modules + v_passed_quizzes;

  -- Calculate percentage
  IF v_total_items > 0 THEN
    v_progress_pct := (v_completed_items * 100) / v_total_items;
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
$$;

-- Create trigger to update progress when quiz is passed
CREATE OR REPLACE FUNCTION public.update_progress_on_quiz_pass()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only trigger when a quiz is newly passed
  IF NEW.is_passed = true AND (OLD.is_passed IS NULL OR OLD.is_passed = false) THEN
    PERFORM calculate_enrollment_progress(NEW.enrollment_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_quiz_pass_progress ON lms_quiz_attempts;
CREATE TRIGGER trigger_quiz_pass_progress
  AFTER INSERT OR UPDATE OF is_passed ON lms_quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_progress_on_quiz_pass();