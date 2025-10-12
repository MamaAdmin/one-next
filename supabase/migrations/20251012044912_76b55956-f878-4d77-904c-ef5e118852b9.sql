-- Fix search_path for newly created functions
ALTER FUNCTION generate_unique_slug(text, uuid) SET search_path = public;
ALTER FUNCTION set_course_slug() SET search_path = public;