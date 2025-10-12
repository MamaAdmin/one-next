-- Add new fields to lms_course_modules for extended module schema
ALTER TABLE lms_course_modules
ADD COLUMN IF NOT EXISTS tools jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS resources jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS author text,
ADD COLUMN IF NOT EXISTS prerequisites text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS tool_recommendation text;

-- Add comments for documentation
COMMENT ON COLUMN lms_course_modules.tools IS 'Array of tool objects with name and url: [{"name": "Miro", "url": "https://..."}]';
COMMENT ON COLUMN lms_course_modules.resources IS 'Array of resource objects with title and url: [{"title": "Guide", "url": "https://..."}]';
COMMENT ON COLUMN lms_course_modules.tags IS 'Array of learning objective tags/keywords';
COMMENT ON COLUMN lms_course_modules.prerequisites IS 'Array of module IDs or names that should be completed first';
COMMENT ON COLUMN lms_course_modules.tool_recommendation IS 'Recommended tool for this module (e.g., Miro for Ideation phase)';
COMMENT ON COLUMN lms_course_modules.author IS 'Module author or trainer name';