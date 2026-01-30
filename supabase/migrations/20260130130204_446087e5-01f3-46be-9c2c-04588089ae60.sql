-- Add bmad_user role to enum (must be committed first)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'bmad_user';