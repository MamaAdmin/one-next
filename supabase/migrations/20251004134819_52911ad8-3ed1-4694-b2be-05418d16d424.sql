-- Create sprint_bookings table
CREATE TABLE IF NOT EXISTS public.sprint_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Contact details
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  team_size INTEGER NOT NULL DEFAULT 4 CHECK (team_size >= 2 AND team_size <= 50),
  preferred_start_date DATE,
  notes TEXT,
  
  -- Feasibility check
  challenge_description TEXT NOT NULL,
  relevance_reason TEXT NOT NULL,
  target_audience TEXT[] NOT NULL,
  consequences TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  
  -- Scoring
  sprint_suitability_score INTEGER CHECK (sprint_suitability_score BETWEEN 0 AND 100),
  recommended_sprint_type TEXT,
  
  -- Status
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_id TEXT,
  
  -- Price
  price_chf INTEGER DEFAULT 999 NOT NULL,
  
  -- Session link
  session_token TEXT UNIQUE
);

-- Enable RLS
ALTER TABLE public.sprint_bookings ENABLE ROW LEVEL SECURITY;

-- Anyone can create bookings (public form)
CREATE POLICY "Anyone can create bookings"
  ON public.sprint_bookings FOR INSERT
  WITH CHECK (true);

-- Users can view their own bookings by email
CREATE POLICY "Users can view own bookings by email"
  ON public.sprint_bookings FOR SELECT
  USING (
    email = COALESCE(
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      email
    )
  );

-- Authenticated users can update their own bookings
CREATE POLICY "Users can update own bookings"
  ON public.sprint_bookings FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
  ON public.sprint_bookings FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_sprint_bookings_updated_at
  BEFORE UPDATE ON public.sprint_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for email lookups
CREATE INDEX idx_sprint_bookings_email ON public.sprint_bookings(email);
CREATE INDEX idx_sprint_bookings_payment_status ON public.sprint_bookings(payment_status);
CREATE INDEX idx_sprint_bookings_session_token ON public.sprint_bookings(session_token);