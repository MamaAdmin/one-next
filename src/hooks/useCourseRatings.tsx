import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CourseRating {
  id: string;
  participant_id: string;
  course_id: string;
  enrollment_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

export const useCourseRatings = (courseId?: string) => {
  const [ratings, setRatings] = useState<CourseRating[]>([]);
  const [userRating, setUserRating] = useState<CourseRating | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRatings = async () => {
    if (!courseId) {
      setRatings([]);
      setUserRating(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load public (anonymized) ratings for course display — no participant_id exposed
      const { data: ratingsData, error: ratingsError } = await (supabase as any)
        .from("lms_course_ratings_public")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (ratingsError) throw ratingsError;
      setRatings((ratingsData || []) as CourseRating[]);

      // Load user's own rating via security-definer RPC (participant_id is column-restricted)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: ownRatingRows, error: ownRatingError } = await (supabase as any)
          .rpc("get_own_course_rating", { p_course_id: courseId });

        if (ownRatingError) throw ownRatingError;
        const ownRating = Array.isArray(ownRatingRows) ? ownRatingRows[0] : ownRatingRows;
        setUserRating((ownRating as CourseRating) || null);
      }
    } catch (error) {
      console.error("Error loading ratings:", error);
      toast.error("Fehler beim Laden der Bewertungen");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadRatings();
  }, [courseId]);

  const createRating = async (
    enrollmentId: string,
    rating: number,
    reviewText?: string
  ) => {
    try {
      if (!courseId) throw new Error("Keine Kurs-ID");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      const { data: participant } = await supabase
        .from("participants")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!participant) throw new Error("Kein Teilnehmer-Profil gefunden");

      const { error } = await supabase
        .from("lms_course_ratings")
        .insert({
          participant_id: participant.id,
          course_id: courseId,
          enrollment_id: enrollmentId,
          rating,
          review_text: reviewText || null,
        });

      if (error) throw error;
      
      toast.success("Bewertung abgegeben");
      await loadRatings();
    } catch (error: any) {
      console.error("Error creating rating:", error);
      toast.error(error.message || "Fehler beim Erstellen der Bewertung");
      throw error;
    }
  };

  const updateRating = async (
    ratingId: string,
    rating: number,
    reviewText?: string
  ) => {
    try {
      const { error } = await supabase
        .from("lms_course_ratings")
        .update({
          rating,
          review_text: reviewText || null,
        })
        .eq("id", ratingId);

      if (error) throw error;
      
      toast.success("Bewertung aktualisiert");
      await loadRatings();
    } catch (error: any) {
      console.error("Error updating rating:", error);
      toast.error(error.message || "Fehler beim Aktualisieren der Bewertung");
      throw error;
    }
  };

  return {
    ratings,
    userRating,
    loading,
    createRating,
    updateRating,
    reload: loadRatings,
  };
};
