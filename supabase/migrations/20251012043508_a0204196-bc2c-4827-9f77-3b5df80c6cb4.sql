-- Erweitere lms_courses_with_stats View für module_count und author info
DROP VIEW IF EXISTS lms_courses_with_stats;

CREATE VIEW lms_courses_with_stats AS
SELECT 
  c.*,
  COUNT(DISTINCT e.id) as enrolled_students_count,
  COUNT(DISTINCT m.id) as module_count,
  'MamaAdmin2012' as author_name,
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' as author_avatar
FROM lms_courses c
LEFT JOIN lms_course_purchases p ON p.course_id = c.id
LEFT JOIN lms_course_enrollments e ON e.purchase_id = p.id
LEFT JOIN lms_course_modules m ON m.course_id = c.id
GROUP BY c.id;