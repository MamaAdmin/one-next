-- Secure RLS policies for quiz tables

-- lms_quizzes policies
DROP POLICY IF EXISTS "Admins can manage quizzes" ON lms_quizzes;
DROP POLICY IF EXISTS "Enrolled participants can view quizzes" ON lms_quizzes;

CREATE POLICY "Admins can manage quizzes"
ON lms_quizzes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enrolled participants can view quizzes"
ON lms_quizzes
FOR SELECT
USING (
  module_id IN (
    SELECT m.id
    FROM lms_course_modules m
    JOIN lms_course_purchases p ON m.course_id = p.course_id
    JOIN lms_course_enrollments e ON e.purchase_id = p.id
    JOIN participants pt ON e.participant_id = pt.id
    WHERE pt.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- lms_quiz_questions policies
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON lms_quiz_questions;
DROP POLICY IF EXISTS "Enrolled participants can view quiz questions" ON lms_quiz_questions;

CREATE POLICY "Admins can manage quiz questions"
ON lms_quiz_questions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enrolled participants can view quiz questions"
ON lms_quiz_questions
FOR SELECT
USING (
  quiz_id IN (
    SELECT q.id
    FROM lms_quizzes q
    JOIN lms_course_modules m ON q.module_id = m.id
    JOIN lms_course_purchases p ON m.course_id = p.course_id
    JOIN lms_course_enrollments e ON e.purchase_id = p.id
    JOIN participants pt ON e.participant_id = pt.id
    WHERE pt.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- lms_quiz_attempts policies
DROP POLICY IF EXISTS "Participants can manage own quiz attempts" ON lms_quiz_attempts;

CREATE POLICY "Participants can manage own quiz attempts"
ON lms_quiz_attempts
FOR ALL
USING (
  enrollment_id IN (
    SELECT lms_course_enrollments.id
    FROM lms_course_enrollments
    WHERE lms_course_enrollments.participant_id IN (
      SELECT participants.id
      FROM participants
      WHERE participants.user_id = auth.uid()
    )
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);