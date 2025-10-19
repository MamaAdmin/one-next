-- ========================================
-- CMS EXTENSION: Database Schema
-- ========================================

-- ========================================
-- FEATURE 2: Media Library Extensions
-- ========================================

-- Extend media table with additional fields
ALTER TABLE media 
ADD COLUMN IF NOT EXISTS width integer,
ADD COLUMN IF NOT EXISTS height integer,
ADD COLUMN IF NOT EXISTS thumbnail_path text,
ADD COLUMN IF NOT EXISTS optimized_path text;

-- Indexes for faster media queries
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);

-- ========================================
-- FEATURE 3: Content Versioning
-- ========================================

-- Create content_versions table for tracking all content changes
CREATE TABLE IF NOT EXISTS content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL, -- 'articles', 'page_content', 'faq_items'
  content_id uuid NOT NULL,
  version_number integer NOT NULL,
  content jsonb NOT NULL, -- Full snapshot of content at this version
  changed_by uuid REFERENCES auth.users(id),
  change_summary text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id, version_number)
);

-- Enable RLS on content_versions
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_versions
CREATE POLICY "Admins can manage all versions"
ON content_versions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Content managers can view versions"
ON content_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'content_manager')
  )
);

-- Index for efficient version lookups
CREATE INDEX IF NOT EXISTS idx_content_versions_lookup 
ON content_versions(content_type, content_id, version_number DESC);

-- Function to automatically create versions on updates
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS trigger AS $$
DECLARE
  next_version integer;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM content_versions
  WHERE content_type = TG_TABLE_NAME
    AND content_id = OLD.id;
  
  -- Insert version snapshot
  INSERT INTO content_versions (
    content_type,
    content_id,
    version_number,
    content,
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    OLD.id,
    next_version,
    to_jsonb(OLD),
    auth.uid()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ========================================
-- FEATURE 4: Workflow Management
-- ========================================

-- Add workflow fields to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS workflow_status text DEFAULT 'draft' 
  CHECK (workflow_status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
ADD COLUMN IF NOT EXISTS scheduled_publish_at timestamptz;

-- Add workflow fields to page_content table
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS workflow_status text DEFAULT 'published'
  CHECK (workflow_status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Add workflow fields to faq_items table
ALTER TABLE faq_items
ADD COLUMN IF NOT EXISTS workflow_status text DEFAULT 'published'
  CHECK (workflow_status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Create workflow_comments table
CREATE TABLE IF NOT EXISTS workflow_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on workflow_comments
ALTER TABLE workflow_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_comments
CREATE POLICY "Admins and content managers can manage comments"
ON workflow_comments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'content_manager')
  )
);

-- Index for workflow comments
CREATE INDEX IF NOT EXISTS idx_workflow_comments_lookup 
ON workflow_comments(content_type, content_id, created_at DESC);

-- ========================================
-- FEATURE 5: Navigation Manager
-- ========================================

-- Create navigation_menus table
CREATE TABLE IF NOT EXISTS navigation_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create navigation_items table
CREATE TABLE IF NOT EXISTS navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid REFERENCES navigation_menus(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES navigation_items(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  target text DEFAULT '_self',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on navigation tables
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for navigation_menus
CREATE POLICY "Admins can manage menus"
ON navigation_menus FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Everyone can view menus"
ON navigation_menus FOR SELECT
USING (true);

-- RLS Policies for navigation_items
CREATE POLICY "Admins can manage menu items"
ON navigation_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Everyone can view active menu items"
ON navigation_items FOR SELECT
USING (is_active = true);

-- Indexes for navigation
CREATE INDEX IF NOT EXISTS idx_navigation_items_menu 
ON navigation_items(menu_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_navigation_items_parent 
ON navigation_items(parent_id);

-- Insert default menus
INSERT INTO navigation_menus (name, label) VALUES 
  ('header', 'Hauptmenü'),
  ('footer', 'Footer-Menü')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- FEATURE 6: SEO Extensions
-- ========================================

-- Add SEO fields to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS seo_keywords text[],
ADD COLUMN IF NOT EXISTS og_image text,
ADD COLUMN IF NOT EXISTS og_type text DEFAULT 'article',
ADD COLUMN IF NOT EXISTS canonical_url text,
ADD COLUMN IF NOT EXISTS robots_meta text DEFAULT 'index, follow';

-- Add SEO fields to page_content table
ALTER TABLE page_content
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS seo_keywords text[],
ADD COLUMN IF NOT EXISTS og_image text,
ADD COLUMN IF NOT EXISTS canonical_url text,
ADD COLUMN IF NOT EXISTS robots_meta text DEFAULT 'index, follow';

-- Create seo_redirects table
CREATE TABLE IF NOT EXISTS seo_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path text NOT NULL UNIQUE,
  to_path text NOT NULL,
  redirect_type integer DEFAULT 301,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on seo_redirects
ALTER TABLE seo_redirects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seo_redirects
CREATE POLICY "Admins can manage redirects"
ON seo_redirects FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Everyone can view active redirects"
ON seo_redirects FOR SELECT
USING (is_active = true);

-- Index for redirects
CREATE INDEX IF NOT EXISTS idx_seo_redirects_from 
ON seo_redirects(from_path) WHERE is_active = true;