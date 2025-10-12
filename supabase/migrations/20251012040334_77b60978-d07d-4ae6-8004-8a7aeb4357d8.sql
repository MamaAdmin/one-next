-- Neue Spalten zu lms_courses hinzufügen
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS skill_level text DEFAULT 'Alle Schwierigkeitsgrade';
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS total_lessons integer DEFAULT 0;
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS total_quizzes integer DEFAULT 0;
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 0.00;
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0;
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS completion_deadline_days integer DEFAULT 30;
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS includes_certificate boolean DEFAULT true;
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS language text DEFAULT 'Deutsch';
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS prerequisites text;

-- View für enrolled_students_count erstellen
CREATE OR REPLACE VIEW lms_courses_with_stats AS
SELECT 
  c.*,
  COUNT(DISTINCT e.id) as enrolled_students_count
FROM lms_courses c
LEFT JOIN lms_course_purchases p ON p.course_id = c.id
LEFT JOIN lms_course_enrollments e ON e.purchase_id = p.id
GROUP BY c.id;