-- Remove phase_number column from lms_tools table
ALTER TABLE lms_tools DROP COLUMN IF EXISTS phase_number;