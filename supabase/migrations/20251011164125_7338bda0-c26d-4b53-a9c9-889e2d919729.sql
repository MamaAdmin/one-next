-- Create storage bucket for LMS artifacts
INSERT INTO storage.buckets (id, name, public)
VALUES ('lms-artifacts', 'lms-artifacts', false);

-- RLS Policy: Participants can upload artifacts to their own enrollments
CREATE POLICY "Participants can upload own artifacts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lms-artifacts' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM lms_course_enrollments
    WHERE participant_id IN (
      SELECT id FROM participants WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policy: Participants can view artifacts from their own enrollments
CREATE POLICY "Participants can view own artifacts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lms-artifacts' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM lms_course_enrollments
    WHERE participant_id IN (
      SELECT id FROM participants WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policy: Participants can delete their own artifacts
CREATE POLICY "Participants can delete own artifacts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lms-artifacts' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM lms_course_enrollments
    WHERE participant_id IN (
      SELECT id FROM participants WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policy: Admins can manage all artifacts
CREATE POLICY "Admins can manage all artifacts"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'lms-artifacts' AND
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'lms-artifacts' AND
  has_role(auth.uid(), 'admin'::app_role)
);