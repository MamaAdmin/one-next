
DROP VIEW IF EXISTS public.lms_courses_with_stats;

CREATE VIEW public.lms_courses_with_stats
WITH (security_invoker=on) AS
SELECT c.id,
    c.title,
    c.description_html AS description,
    c.course_type,
    c.price_chf,
    c.duration_days,
    c.is_active,
    c.created_at,
    c.updated_at,
    c.featured_image AS thumbnail_url,
    c.difficulty AS skill_level,
    c.total_lessons,
    c.total_quizzes,
    c.rating,
    c.rating_count,
    c.completion_deadline_days,
    c.includes_certificate,
    c.language,
    c.prerequisites,
    c.slug,
    c.visibility,
    c.is_public,
    c.public_course_id,
    count(DISTINCT e.id) AS enrolled_students_count,
    count(DISTINCT m.id) AS module_count,
    'MamaAdmin2012'::text AS author_name,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'::text AS author_avatar
   FROM public.lms_courses c
     LEFT JOIN public.lms_course_purchases p ON p.course_id = c.id
     LEFT JOIN public.lms_course_enrollments e ON e.purchase_id = p.id
     LEFT JOIN public.lms_course_modules m ON m.course_id = c.id
  GROUP BY c.id;

GRANT SELECT ON public.lms_courses_with_stats TO authenticated, anon;
