import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CourseRating {
  id: string;
  rating: number;
  review_text: string | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
}

interface Purchase {
  course: Course;
}

export interface EnrollmentWithCourse {
  id: string;
  participant_id: string;
  purchase_id: string;
  current_phase: number;
  progress_percentage: number;
  completed_at: string | null;
  enrolled_at: string;
  purchase: Purchase;
  rating: CourseRating | null;
}

export const useEnrollmentsWithCourses = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEnrollments([]);
        return;
      }

      // Get participant ID
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (participantError) throw participantError;
      if (!participant) {
        setEnrollments([]);
        return;
      }

      // Load enrollments with course and rating data
      const { data, error } = await supabase
        .from("lms_course_enrollments")
        .select(`
          *,
          purchase:lms_course_purchases!inner (
            course:lms_courses!inner (
              id,
              title,
              slug,
              featured_image
            )
          ),
          rating:lms_course_ratings (
            id,
            rating,
            review_text
          )
        `)
        .eq("participant_id", participant.id)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

      // Transform data to match interface
      const transformedData = (data || []).map((enrollment: any) => ({
        ...enrollment,
        rating: enrollment.rating?.[0] || null,
      }));

      setEnrollments(transformedData);
    } catch (error) {
      console.error("Error loading enrollments:", error);
      toast.error("Fehler beim Laden der Kurse");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  return { enrollments, loading, reload: loadEnrollments };
};
