-- Add content_manager role to enum (must be done separately)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'content_manager';