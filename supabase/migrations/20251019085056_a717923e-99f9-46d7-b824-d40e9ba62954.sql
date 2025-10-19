-- Phase 1: Create course-tools and lesson-tools relationship tables

-- 1.1 Create lms_course_tools table
CREATE TABLE IF NOT EXISTS public.lms_course_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.lms_tools(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 1,
  is_required boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(course_id, tool_id)
);

-- Enable RLS on lms_course_tools
ALTER TABLE public.lms_course_tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lms_course_tools
CREATE POLICY "Admins can manage course tools"
ON public.lms_course_tools
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enrolled participants can view course tools"
ON public.lms_course_tools
FOR SELECT
USING (
  course_id IN (
    SELECT p.course_id
    FROM lms_course_purchases p
    JOIN lms_course_enrollments e ON e.purchase_id = p.id
    JOIN participants pt ON e.participant_id = pt.id
    WHERE pt.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

-- 1.2 Create lms_lesson_tools table
CREATE TABLE IF NOT EXISTS public.lms_lesson_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lms_lessons(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.lms_tools(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 1,
  is_required boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(lesson_id, tool_id)
);

-- Enable RLS on lms_lesson_tools
ALTER TABLE public.lms_lesson_tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lms_lesson_tools
CREATE POLICY "Admins can manage lesson tools"
ON public.lms_lesson_tools
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enrolled participants can view lesson tools"
ON public.lms_lesson_tools
FOR SELECT
USING (
  lesson_id IN (
    SELECT l.id
    FROM lms_lessons l
    JOIN lms_course_modules m ON l.module_id = m.id
    JOIN lms_course_purchases p ON m.course_id = p.course_id
    JOIN lms_course_enrollments e ON e.purchase_id = p.id
    JOIN participants pt ON e.participant_id = pt.id
    WHERE pt.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

-- 1.3 Migrate existing tools data from lms_course_modules JSONB field (if any)
-- Check if tools column exists and migrate data to lms_module_tools
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lms_course_modules' AND column_name = 'tools'
  ) THEN
    -- Migration logic would go here if needed
    -- For now, we'll just drop the column as it's deprecated
    ALTER TABLE public.lms_course_modules DROP COLUMN IF EXISTS tools;
  END IF;
END $$;