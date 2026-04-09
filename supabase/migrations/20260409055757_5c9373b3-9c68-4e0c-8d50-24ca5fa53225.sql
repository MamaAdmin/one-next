
-- Kurse-Tabelle
CREATE TABLE public.public_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  description_html TEXT,
  price_chf NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CHF',
  featured_image TEXT,
  youtube_url TEXT,
  max_participants INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  slug TEXT UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kurstermine
CREATE TABLE public.public_course_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.public_courses(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kurs-Anmeldungen
CREATE TABLE public.public_course_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.public_courses(id) ON DELETE CASCADE,
  course_date_id UUID REFERENCES public.public_course_dates(id) ON DELETE SET NULL,
  user_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  payment_method TEXT NOT NULL DEFAULT 'stripe',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  amount_paid NUMERIC(10,2),
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.public_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_course_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_course_registrations ENABLE ROW LEVEL SECURITY;

-- Kurse: öffentlich lesbar
CREATE POLICY "Public courses are viewable by everyone"
  ON public.public_courses FOR SELECT USING (true);

-- Kurse: Admins können alles
CREATE POLICY "Admins can manage courses"
  ON public.public_courses FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Kurstermine: öffentlich lesbar
CREATE POLICY "Course dates are viewable by everyone"
  ON public.public_course_dates FOR SELECT USING (true);

-- Kurstermine: Admins können alles
CREATE POLICY "Admins can manage course dates"
  ON public.public_course_dates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anmeldungen: Jeder kann erstellen
CREATE POLICY "Anyone can register for courses"
  ON public.public_course_registrations FOR INSERT
  WITH CHECK (true);

-- Anmeldungen: Nutzer sehen eigene
CREATE POLICY "Users can view own registrations"
  ON public.public_course_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Anmeldungen: Admins sehen alle
CREATE POLICY "Admins can manage registrations"
  ON public.public_course_registrations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at Trigger
CREATE TRIGGER update_public_courses_updated_at
  BEFORE UPDATE ON public.public_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_public_course_registrations_updated_at
  BEFORE UPDATE ON public.public_course_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
