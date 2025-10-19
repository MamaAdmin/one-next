-- Create page_templates table for managing service pages
CREATE TABLE IF NOT EXISTS public.page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  layout_type TEXT NOT NULL CHECK (layout_type IN ('main-service', 'sub-service')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image TEXT,
  canonical_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_templates_slug ON public.page_templates(slug);
CREATE INDEX IF NOT EXISTS idx_page_templates_published ON public.page_templates(is_published);
CREATE INDEX IF NOT EXISTS idx_page_templates_layout_type ON public.page_templates(layout_type);

-- Enable Row Level Security
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all page templates
CREATE POLICY "Admins can manage page templates"
  ON public.page_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Published pages are publicly readable
CREATE POLICY "Published pages are publicly readable"
  ON public.page_templates
  FOR SELECT
  USING (is_published = true);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_page_templates_updated_at
  BEFORE UPDATE ON public.page_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();