-- Phase 1: Add content_manager role to enum
-- This must be done in a separate transaction before using it in policies
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'content_manager';