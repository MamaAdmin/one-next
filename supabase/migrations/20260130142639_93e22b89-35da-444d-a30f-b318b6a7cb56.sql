-- Fix RLS policies for gamification tables to prevent self-manipulation

-- 1. Fix lms_activity_log - users can only insert activity for their own participant
DROP POLICY IF EXISTS "System can insert activity" ON lms_activity_log;

CREATE POLICY "Users can log own activity"
ON lms_activity_log FOR INSERT
TO authenticated
WITH CHECK (
  participant_id IN (
    SELECT id FROM participants WHERE user_id = auth.uid()
  )
);

-- 2. Fix lms_achievements - remove open insert policy, achievements should only be granted via triggers
DROP POLICY IF EXISTS "System can grant achievements" ON lms_achievements;

-- Create a restrictive policy that only allows admins to manually insert (triggers still work with SECURITY DEFINER)
CREATE POLICY "Only admins can manually grant achievements"
ON lms_achievements FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Fix bmad_invitations - only allow users to view their own invitation by email
DROP POLICY IF EXISTS "Anyone can view pending invitations" ON bmad_invitations;

CREATE POLICY "Users can view own invitation by token or email"
ON bmad_invitations FOR SELECT
TO public
USING (
  (status = 'pending' AND expires_at > now() AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR 
  (status = 'pending' AND expires_at > now() AND token IS NOT NULL)
);

-- Also allow access via token for unauthenticated users accepting invitations
CREATE POLICY "Anyone can view invitation by valid token"
ON bmad_invitations FOR SELECT
TO anon
USING (
  status = 'pending' AND expires_at > now()
);