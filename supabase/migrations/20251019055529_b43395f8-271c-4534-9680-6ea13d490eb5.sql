-- Add sort_order column to lms_tools
ALTER TABLE lms_tools 
ADD COLUMN sort_order INTEGER;

-- Set initial sort_order based on current title ordering
UPDATE lms_tools 
SET sort_order = sub.row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY title) as row_num 
  FROM lms_tools
) sub 
WHERE lms_tools.id = sub.id;

-- Make sort_order not null with default
ALTER TABLE lms_tools 
ALTER COLUMN sort_order SET NOT NULL,
ALTER COLUMN sort_order SET DEFAULT 0;