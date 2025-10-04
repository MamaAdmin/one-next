-- Add new columns to sprint_bookings table for extended feasibility check
ALTER TABLE public.sprint_bookings
ADD COLUMN testable_in_5_days text,
ADD COLUMN decider_available boolean,
ADD COLUMN user_access_count integer,
ADD COLUMN impact_scale integer CHECK (impact_scale >= 1 AND impact_scale <= 5),
ADD COLUMN gates_ok boolean DEFAULT false;