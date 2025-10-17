-- Erweitere customers Tabelle
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS company_size text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS primary_admin_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS position text;

-- Security Definer Function für Company Admin Check
CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id uuid, _customer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.participants p
    JOIN public.user_roles ur ON p.user_id = ur.user_id
    WHERE p.user_id = _user_id
      AND p.customer_id = _customer_id
      AND ur.role = 'admin'
  )
$$;

-- Tabelle für User Invitations
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(customer_id, email)
);

-- RLS für user_invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can manage invitations"
  ON public.user_invitations FOR ALL
  USING (
    customer_id IN (
      SELECT p.customer_id 
      FROM participants p
      JOIN user_roles ur ON p.user_id = ur.user_id
      WHERE p.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Invited users can view their own invitation"
  ON public.user_invitations FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Tabelle für Course Ratings
CREATE TABLE IF NOT EXISTS public.lms_course_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES public.lms_course_enrollments(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(participant_id, course_id)
);

-- RLS für lms_course_ratings
ALTER TABLE public.lms_course_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON public.lms_course_ratings FOR SELECT
  USING (true);

CREATE POLICY "Participants can create ratings for completed courses"
  ON public.lms_course_ratings FOR INSERT
  WITH CHECK (
    participant_id IN (
      SELECT id FROM participants WHERE user_id = auth.uid()
    )
    AND enrollment_id IN (
      SELECT id FROM lms_course_enrollments 
      WHERE participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())
      AND completed_at IS NOT NULL
    )
  );

CREATE POLICY "Participants can update own ratings"
  ON public.lms_course_ratings FOR UPDATE
  USING (
    participant_id IN (
      SELECT id FROM participants WHERE user_id = auth.uid()
    )
  );

-- Trigger für updated_at auf ratings
CREATE TRIGGER update_lms_course_ratings_updated_at
  BEFORE UPDATE ON public.lms_course_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function zum Aktualisieren der Kurs-Ratings
CREATE OR REPLACE FUNCTION public.update_course_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE lms_courses
  SET 
    rating = (
      SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
      FROM lms_course_ratings
      WHERE course_id = NEW.course_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM lms_course_ratings
      WHERE course_id = NEW.course_id
    )
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$;

-- Trigger zum Aktualisieren der Kurs-Ratings
CREATE TRIGGER after_rating_insert_or_update
  AFTER INSERT OR UPDATE ON public.lms_course_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_course_rating();

-- Storage Bucket für Company Logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS für company-logos bucket
CREATE POLICY "Company admins can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.uid() IN (
      SELECT p.user_id FROM participants p
      JOIN user_roles ur ON p.user_id = ur.user_id
      WHERE ur.role = 'admin'
    )
  );

CREATE POLICY "Company admins can update logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-logos'
    AND auth.uid() IN (
      SELECT p.user_id FROM participants p
      JOIN user_roles ur ON p.user_id = ur.user_id
      WHERE ur.role = 'admin'
    )
  );

CREATE POLICY "Company admins can delete logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-logos'
    AND auth.uid() IN (
      SELECT p.user_id FROM participants p
      JOIN user_roles ur ON p.user_id = ur.user_id
      WHERE ur.role = 'admin'
    )
  );

CREATE POLICY "Company logos are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');