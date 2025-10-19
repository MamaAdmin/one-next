import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CourseCategory } from "@/lib/categoryMappings";

interface Enrollment {
  id: string;
  purchase_id: string;
  participant_id: string;
  enrolled_at: string;
  completed_at: string | null;
  status: "active" | "completed" | "dropped";
  current_category: CourseCategory;
  progress_percentage: number;
}

export const useLMSEnrollment = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentEnrollment, setCurrentEnrollment] = useState<Enrollment | null>(null);

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: participant } = await (supabase as any)
          .from("participants")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!participant) {
          setLoading(false);
          return;
        }

        const { data, error } = await (supabase as any)
          .from("lms_course_enrollments")
          .select("*")
          .eq("participant_id", participant.id)
          .order("enrolled_at", { ascending: false });

        if (error) throw error;
        
        setEnrollments(data || []);
        const active = data?.find(e => e.status === "active");
        setCurrentEnrollment(active || null);

      } catch (error) {
        console.error("Error loading enrollments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();

    const channel = supabase
      .channel("enrollment-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lms_course_enrollments"
        },
        (payload) => {
          setEnrollments(prev =>
            prev.map(e => (e.id === payload.new.id ? { ...e, ...payload.new as Enrollment } : e))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateProgress = async (enrollmentId: string, category: CourseCategory) => {
    const { error } = await (supabase as any)
      .from("lms_course_enrollments")
      .update({ current_category: category })
      .eq("id", enrollmentId);

    if (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  };

  return {
    enrollments,
    currentEnrollment,
    loading,
    updateProgress,
    reload: () => setLoading(true)
  };
};
