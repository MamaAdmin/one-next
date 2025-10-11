-- Phase 4: Gamification tables and functions

-- Activity log for streak calculation
CREATE TABLE IF NOT EXISTS lms_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  activity_date date NOT NULL,
  activity_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_activity_log_participant ON lms_activity_log(participant_id, activity_date DESC);

-- Achievements table
CREATE TABLE IF NOT EXISTS lms_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(participant_id, achievement_type)
);

-- RLS policies for activity_log
ALTER TABLE lms_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view own activity"
ON lms_activity_log FOR SELECT
TO authenticated
USING (
  participant_id IN (
    SELECT id FROM participants WHERE user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "System can insert activity"
ON lms_activity_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS policies for achievements
ALTER TABLE lms_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view own achievements"
ON lms_achievements FOR SELECT
TO authenticated
USING (
  participant_id IN (
    SELECT id FROM participants WHERE user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "System can grant achievements"
ON lms_achievements FOR INSERT
TO authenticated
WITH CHECK (true);

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_streak(p_participant_id uuid)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  v_streak int := 0;
  v_current_date date := CURRENT_DATE;
  v_has_activity boolean;
BEGIN
  -- Count consecutive days from today backwards
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM lms_activity_log
      WHERE participant_id = p_participant_id
        AND activity_date = v_current_date
    ) INTO v_has_activity;
    
    IF v_has_activity THEN
      v_streak := v_streak + 1;
      v_current_date := v_current_date - 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_streak;
END;
$$;

-- Trigger: Log activity when module completed
CREATE OR REPLACE FUNCTION log_module_activity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_participant_id uuid;
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    -- Get participant_id from enrollment
    SELECT e.participant_id INTO v_participant_id
    FROM lms_course_enrollments e
    WHERE e.id = NEW.enrollment_id;
    
    -- Log activity
    INSERT INTO lms_activity_log (participant_id, activity_date, activity_type)
    VALUES (v_participant_id, CURRENT_DATE, 'module_completed')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_module_activity
AFTER UPDATE ON lms_module_progress
FOR EACH ROW
EXECUTE FUNCTION log_module_activity();

-- Trigger: First phase achievement
CREATE OR REPLACE FUNCTION check_first_phase_achievement()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.current_phase >= 2 AND (OLD.current_phase IS NULL OR OLD.current_phase < 2) THEN
    INSERT INTO lms_achievements (participant_id, achievement_type)
    VALUES (NEW.participant_id, 'first_phase')
    ON CONFLICT (participant_id, achievement_type) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_first_phase_achievement
AFTER UPDATE ON lms_course_enrollments
FOR EACH ROW
EXECUTE FUNCTION check_first_phase_achievement();

-- Trigger: All phases completed achievement
CREATE OR REPLACE FUNCTION check_all_phases_achievement()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.current_phase >= 5 AND NEW.progress_percentage >= 100 THEN
    INSERT INTO lms_achievements (participant_id, achievement_type)
    VALUES (NEW.participant_id, 'all_phases')
    ON CONFLICT (participant_id, achievement_type) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_all_phases_achievement
AFTER UPDATE ON lms_course_enrollments
FOR EACH ROW
EXECUTE FUNCTION check_all_phases_achievement();

-- Trigger: 10 artifacts achievement
CREATE OR REPLACE FUNCTION check_artifact_achievement()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_artifact_count int;
  v_participant_id uuid;
BEGIN
  -- Get participant_id from enrollment
  SELECT e.participant_id INTO v_participant_id
  FROM lms_course_enrollments e
  WHERE e.id = NEW.enrollment_id;
  
  -- Count total artifacts for this participant
  SELECT COUNT(*) INTO v_artifact_count
  FROM lms_artifacts a
  JOIN lms_course_enrollments e ON a.enrollment_id = e.id
  WHERE e.participant_id = v_participant_id;
  
  IF v_artifact_count >= 10 THEN
    INSERT INTO lms_achievements (participant_id, achievement_type)
    VALUES (v_participant_id, 'artifact_10')
    ON CONFLICT (participant_id, achievement_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_artifact_achievement
AFTER INSERT ON lms_artifacts
FOR EACH ROW
EXECUTE FUNCTION check_artifact_achievement();

-- Trigger: 7-day streak achievement
CREATE OR REPLACE FUNCTION check_streak_achievement()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_streak int;
BEGIN
  v_streak := calculate_streak(NEW.participant_id);
  
  IF v_streak >= 7 THEN
    INSERT INTO lms_achievements (participant_id, achievement_type)
    VALUES (NEW.participant_id, 'streak_7')
    ON CONFLICT (participant_id, achievement_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_streak_achievement
AFTER INSERT ON lms_activity_log
FOR EACH ROW
EXECUTE FUNCTION check_streak_achievement();