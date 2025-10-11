-- Tighten RLS policies on sprint_bookings to prevent anonymous data access

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view own bookings by email" ON public.sprint_bookings;

-- Create a more restrictive SELECT policy that only allows:
-- 1. Authenticated users to view their own bookings (by matching email)
-- 2. Admins to view all bookings
CREATE POLICY "Authenticated users can view own bookings"
ON public.sprint_bookings
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND email = (
    SELECT users.email::text
    FROM auth.users
    WHERE users.id = auth.uid()
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure the UPDATE policy also requires authentication
DROP POLICY IF EXISTS "Users can update own bookings" ON public.sprint_bookings;

CREATE POLICY "Authenticated users can update own bookings"
ON public.sprint_bookings
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND email = (
    SELECT users.email::text
    FROM auth.users
    WHERE users.id = auth.uid()
  )
);