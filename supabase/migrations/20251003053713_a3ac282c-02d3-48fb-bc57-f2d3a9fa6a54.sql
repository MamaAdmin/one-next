-- Phase 1: Fix Email Exposure in Profiles Table
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create granular policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Phase 2: Restrict Categories Management
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;

CREATE POLICY "Admin and content managers can delete categories"
ON public.categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_manager'::app_role));

CREATE POLICY "Admin and content managers can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_manager'::app_role));

CREATE POLICY "Admin and content managers can update categories"
ON public.categories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_manager'::app_role));

-- Phase 2: Restrict Tags Management
DROP POLICY IF EXISTS "Authenticated users can delete tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can update tags" ON public.tags;

CREATE POLICY "Admin and content managers can delete tags"
ON public.tags
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_manager'::app_role));

CREATE POLICY "Admin and content managers can insert tags"
ON public.tags
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_manager'::app_role));

CREATE POLICY "Admin and content managers can update tags"
ON public.tags
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_manager'::app_role));

-- Phase 2: Restrict Article Tags Management
DROP POLICY IF EXISTS "Authenticated users can manage article tags" ON public.article_tags;

CREATE POLICY "Admin and content managers can manage article tags"
ON public.article_tags
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_manager'::app_role));