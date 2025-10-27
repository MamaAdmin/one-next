-- Phase 1 Complete Database Migration
-- Quiz System + Enrollment Invitations Enhancement

-- =====================================================
-- Quiz/Assessment System Tables
-- =====================================================

-- Quizzes table
CREATE TABLE IF NOT EXISTS public.lms_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.lms_course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS public.lms_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.lms_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB,
  correct_answer JSONB NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS public.lms_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.lms_course_enrollments(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.lms_quizzes(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  score INTEGER,
  answers JSONB,
  is_passed BOOLEAN,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add invitation message to user_invitations
ALTER TABLE public.user_invitations 
ADD COLUMN IF NOT EXISTS invitation_message TEXT;

-- Enable RLS
ALTER TABLE public.lms_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage quizzes" ON public.lms_quizzes FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Enrolled participants can view quizzes" ON public.lms_quizzes FOR SELECT USING (module_id IN (SELECT m.id FROM lms_course_modules m JOIN lms_course_purchases p ON m.course_id = p.course_id JOIN lms_course_enrollments e ON e.purchase_id = p.id JOIN participants pt ON e.participant_id = pt.id WHERE pt.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage quiz questions" ON public.lms_quiz_questions FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Enrolled participants can view quiz questions" ON public.lms_quiz_questions FOR SELECT USING (quiz_id IN (SELECT q.id FROM lms_quizzes q JOIN lms_course_modules m ON q.module_id = m.id JOIN lms_course_purchases p ON m.course_id = p.course_id JOIN lms_course_enrollments e ON e.purchase_id = p.id JOIN participants pt ON e.participant_id = pt.id WHERE pt.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can manage own quiz attempts" ON public.lms_quiz_attempts FOR ALL USING (enrollment_id IN (SELECT id FROM lms_course_enrollments WHERE participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())) OR has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_lms_quizzes_updated_at BEFORE UPDATE ON public.lms_quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lms_quiz_questions_updated_at BEFORE UPDATE ON public.lms_quiz_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lms_quiz_attempts_updated_at BEFORE UPDATE ON public.lms_quiz_attempts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lms_quizzes_module_id ON public.lms_quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_lms_quiz_questions_quiz_id ON public.lms_quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_lms_quiz_attempts_enrollment_id ON public.lms_quiz_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lms_quiz_attempts_quiz_id ON public.lms_quiz_attempts(quiz_id);