-- Lektionen Tabelle erstellen
CREATE TABLE lms_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES lms_course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  lesson_type text NOT NULL DEFAULT 'theory',
  content_text text,
  content_video_url text,
  duration_minutes integer DEFAULT 15,
  sort_order integer NOT NULL DEFAULT 1,
  is_required boolean DEFAULT true,
  is_locked boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS für lms_lessons
ALTER TABLE lms_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage lessons"
  ON lms_lessons FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enrolled participants can view lessons"
  ON lms_lessons FOR SELECT
  USING (
    module_id IN (
      SELECT m.id FROM lms_course_modules m
      JOIN lms_course_purchases p ON m.course_id = p.course_id
      JOIN lms_course_enrollments e ON e.purchase_id = p.id
      JOIN participants pt ON e.participant_id = pt.id
      WHERE pt.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Trigger für updated_at
CREATE TRIGGER update_lms_lessons_updated_at
  BEFORE UPDATE ON lms_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indizes
CREATE INDEX idx_lms_lessons_module_id ON lms_lessons(module_id);
CREATE INDEX idx_lms_lessons_sort_order ON lms_lessons(module_id, sort_order);

-- Lektions-Fortschritt Tabelle
CREATE TABLE lms_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES lms_course_enrollments(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lms_lessons(id) ON DELETE CASCADE,
  is_completed boolean NOT NULL DEFAULT false,
  started_at timestamptz,
  completed_at timestamptz,
  time_spent_minutes integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

ALTER TABLE lms_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can manage own lesson progress"
  ON lms_lesson_progress FOR ALL
  USING (
    enrollment_id IN (
      SELECT id FROM lms_course_enrollments
      WHERE participant_id IN (
        SELECT id FROM participants WHERE user_id = auth.uid()
      )
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE TRIGGER update_lms_lesson_progress_updated_at
  BEFORE UPDATE ON lms_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_lms_lesson_progress_enrollment ON lms_lesson_progress(enrollment_id);
CREATE INDEX idx_lms_lesson_progress_lesson ON lms_lesson_progress(lesson_id);