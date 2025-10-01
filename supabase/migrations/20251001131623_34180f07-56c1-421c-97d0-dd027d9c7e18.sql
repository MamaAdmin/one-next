-- Create categories table
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create media table for file management
CREATE TABLE public.media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  alt_text text,
  caption text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add new columns to articles table
ALTER TABLE public.articles 
  ADD COLUMN category_id uuid REFERENCES public.categories(id),
  ADD COLUMN featured_image uuid REFERENCES public.media(id),
  ADD COLUMN status text NOT NULL DEFAULT 'draft',
  ADD COLUMN meta_title text,
  ADD COLUMN meta_description text,
  ADD COLUMN author_id uuid REFERENCES auth.users(id);

-- Create article_tags junction table (many-to-many)
CREATE TABLE public.article_tags (
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, authenticated write)
CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for tags (public read, authenticated write)
CREATE POLICY "Tags are publicly readable"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert tags"
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags"
  ON public.tags FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete tags"
  ON public.tags FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for media (public read, owner write)
CREATE POLICY "Media is publicly readable"
  ON public.media FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload media"
  ON public.media FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own media"
  ON public.media FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own media"
  ON public.media FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);

-- RLS Policies for article_tags (public read, authenticated write)
CREATE POLICY "Article tags are publicly readable"
  ON public.article_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage article tags"
  ON public.article_tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update existing articles RLS to allow authenticated users to manage
CREATE POLICY "Authenticated users can insert articles"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete articles"
  ON public.articles FOR DELETE
  TO authenticated
  USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_author ON public.articles(author_id);
CREATE INDEX idx_media_uploaded_by ON public.media(uploaded_by);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_tags_slug ON public.tags(slug);

-- Insert sample data
INSERT INTO public.categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Articles about technology and innovation'),
  ('Business', 'business', 'Business insights and strategies'),
  ('Design', 'design', 'Design trends and best practices');

INSERT INTO public.tags (name, slug) VALUES
  ('AI', 'ai'),
  ('Machine Learning', 'machine-learning'),
  ('Strategy', 'strategy'),
  ('UX', 'ux'),
  ('Development', 'development');