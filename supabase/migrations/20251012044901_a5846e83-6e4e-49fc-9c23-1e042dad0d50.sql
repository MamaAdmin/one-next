-- Extend lms_courses table for detailed course editing
ALTER TABLE lms_courses
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'draft' CHECK (visibility IN ('public', 'private', 'draft')),
ADD COLUMN IF NOT EXISTS timed_release_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS intro_video jsonb DEFAULT '{"source": null, "file": null, "url": null, "max_mb": 384, "formats": ["mp4", "webm"]}'::jsonb,
ADD COLUMN IF NOT EXISTS pricing jsonb DEFAULT '{"type": "free", "price_chf": null, "currency": "CHF"}'::jsonb,
ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS options jsonb DEFAULT '{"public_course": true, "manual_enrollment": false, "content_drip": []}'::jsonb;

-- Rename description to description_html (keep old data)
ALTER TABLE lms_courses RENAME COLUMN description TO description_html;

-- Rename thumbnail_url to featured_image
ALTER TABLE lms_courses RENAME COLUMN thumbnail_url TO featured_image;

-- Rename skill_level to difficulty
ALTER TABLE lms_courses RENAME COLUMN skill_level TO difficulty;

-- Generate slugs for existing courses
UPDATE lms_courses 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Migrate is_active to visibility
UPDATE lms_courses 
SET visibility = CASE 
  WHEN is_active = true THEN 'public'
  ELSE 'draft'
END
WHERE visibility = 'draft';

-- Migrate price_chf to pricing jsonb
UPDATE lms_courses 
SET pricing = jsonb_build_object(
  'type', CASE WHEN price_chf IS NULL OR price_chf = 0 THEN 'free' ELSE 'paid' END,
  'price_chf', price_chf,
  'currency', 'CHF'
)
WHERE pricing->>'type' IS NULL;

-- Create function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(course_title text, course_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  -- Generate base slug from title
  base_slug := LOWER(REGEXP_REPLACE(REGEXP_REPLACE(course_title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  final_slug := base_slug;
  
  -- Check for duplicates and append counter if needed
  WHILE EXISTS (
    SELECT 1 FROM lms_courses 
    WHERE slug = final_slug 
    AND (course_id IS NULL OR id != course_id)
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Trigger to auto-generate slug before insert
CREATE OR REPLACE FUNCTION set_course_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_course_slug_trigger ON lms_courses;
CREATE TRIGGER set_course_slug_trigger
BEFORE INSERT OR UPDATE OF title
ON lms_courses
FOR EACH ROW
EXECUTE FUNCTION set_course_slug();