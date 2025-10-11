-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create LMS courses table
CREATE TABLE IF NOT EXISTS public.lms_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_type TEXT NOT NULL DEFAULT 'custom',
  price_chf DECIMAL(10, 2),
  duration_days INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create LMS course purchases table
CREATE TABLE IF NOT EXISTS public.lms_course_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  number_of_licenses INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create LMS course enrollments table
CREATE TABLE IF NOT EXISTS public.lms_course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.lms_course_purchases(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  current_phase INTEGER NOT NULL DEFAULT 1,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create LMS course modules table
CREATE TABLE IF NOT EXISTS public.lms_course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  phase_number INTEGER NOT NULL,
  module_type TEXT NOT NULL DEFAULT 'theory',
  content_text TEXT,
  content_video_url TEXT,
  duration_minutes INTEGER,
  sort_order INTEGER NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create LMS module progress table
CREATE TABLE IF NOT EXISTS public.lms_module_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.lms_course_enrollments(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.lms_course_modules(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id, module_id)
);

-- Create LMS artifacts table
CREATE TABLE IF NOT EXISTS public.lms_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.lms_course_enrollments(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.lms_course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create LMS collaboration sessions table
CREATE TABLE IF NOT EXISTS public.lms_collaboration_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.lms_course_modules(id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES public.lms_course_purchases(id) ON DELETE CASCADE,
  session_data JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create LMS votes table
CREATE TABLE IF NOT EXISTS public.lms_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.lms_collaboration_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create LMS GDPR consents table
CREATE TABLE IF NOT EXISTS public.lms_gdpr_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  is_granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_gdpr_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers (Admin only)
CREATE POLICY "Admins can view all customers" ON public.customers
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert customers" ON public.customers
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update customers" ON public.customers
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete customers" ON public.customers
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for participants
CREATE POLICY "Participants can view own data" ON public.participants
  FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage participants" ON public.participants
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for courses (Public read, Admin write)
CREATE POLICY "Everyone can view active courses" ON public.lms_courses
  FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage courses" ON public.lms_courses
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for purchases
CREATE POLICY "Customers can view own purchases" ON public.lms_course_purchases
  FOR SELECT USING (
    customer_id IN (
      SELECT customer_id FROM public.participants WHERE user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage purchases" ON public.lms_course_purchases
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for enrollments
CREATE POLICY "Participants can view own enrollments" ON public.lms_course_enrollments
  FOR SELECT USING (
    participant_id IN (
      SELECT id FROM public.participants WHERE user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Participants can update own enrollment progress" ON public.lms_course_enrollments
  FOR UPDATE USING (
    participant_id IN (
      SELECT id FROM public.participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage enrollments" ON public.lms_course_enrollments
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for modules
CREATE POLICY "Enrolled participants can view course modules" ON public.lms_course_modules
  FOR SELECT USING (
    course_id IN (
      SELECT lms_course_purchases.course_id 
      FROM public.lms_course_enrollments
      JOIN public.lms_course_purchases ON lms_course_enrollments.purchase_id = lms_course_purchases.id
      JOIN public.participants ON lms_course_enrollments.participant_id = participants.id
      WHERE participants.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage modules" ON public.lms_course_modules
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for module progress
CREATE POLICY "Participants can view own progress" ON public.lms_module_progress
  FOR SELECT USING (
    enrollment_id IN (
      SELECT id FROM public.lms_course_enrollments 
      WHERE participant_id IN (
        SELECT id FROM public.participants WHERE user_id = auth.uid()
      )
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Participants can update own progress" ON public.lms_module_progress
  FOR ALL USING (
    enrollment_id IN (
      SELECT id FROM public.lms_course_enrollments 
      WHERE participant_id IN (
        SELECT id FROM public.participants WHERE user_id = auth.uid()
      )
    ) OR has_role(auth.uid(), 'admin')
  );

-- RLS Policies for artifacts
CREATE POLICY "Participants can manage own artifacts" ON public.lms_artifacts
  FOR ALL USING (
    enrollment_id IN (
      SELECT id FROM public.lms_course_enrollments 
      WHERE participant_id IN (
        SELECT id FROM public.participants WHERE user_id = auth.uid()
      )
    ) OR has_role(auth.uid(), 'admin')
  );

-- RLS Policies for collaboration sessions
CREATE POLICY "Team members can view collaboration sessions" ON public.lms_collaboration_sessions
  FOR SELECT USING (
    purchase_id IN (
      SELECT purchase_id FROM public.lms_course_enrollments
      WHERE participant_id IN (
        SELECT id FROM public.participants WHERE user_id = auth.uid()
      )
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Team members can update collaboration sessions" ON public.lms_collaboration_sessions
  FOR ALL USING (
    purchase_id IN (
      SELECT purchase_id FROM public.lms_course_enrollments
      WHERE participant_id IN (
        SELECT id FROM public.participants WHERE user_id = auth.uid()
      )
    ) OR has_role(auth.uid(), 'admin')
  );

-- RLS Policies for votes
CREATE POLICY "Participants can manage own votes" ON public.lms_votes
  FOR ALL USING (
    participant_id IN (
      SELECT id FROM public.participants WHERE user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

-- RLS Policies for GDPR consents
CREATE POLICY "Participants can manage own consents" ON public.lms_gdpr_consents
  FOR ALL USING (
    participant_id IN (
      SELECT id FROM public.participants WHERE user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

-- Create updated_at triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lms_courses_updated_at BEFORE UPDATE ON public.lms_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lms_course_purchases_updated_at BEFORE UPDATE ON public.lms_course_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lms_course_enrollments_updated_at BEFORE UPDATE ON public.lms_course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lms_course_modules_updated_at BEFORE UPDATE ON public.lms_course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lms_module_progress_updated_at BEFORE UPDATE ON public.lms_module_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lms_artifacts_updated_at BEFORE UPDATE ON public.lms_artifacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lms_collaboration_sessions_updated_at BEFORE UPDATE ON public.lms_collaboration_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lms_votes_updated_at BEFORE UPDATE ON public.lms_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lms_gdpr_consents_updated_at BEFORE UPDATE ON public.lms_gdpr_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();