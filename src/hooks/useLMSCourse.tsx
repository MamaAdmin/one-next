import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  course_type: string;
  price_chf: number;
  is_active: boolean;
  created_at: string;
  module_count?: number;
  
  // Preview fields
  thumbnail_url?: string;
  skill_level?: string;
  total_lessons?: number;
  total_quizzes?: number;
  rating?: number;
  rating_count?: number;
  enrolled_students_count?: number;
  completion_deadline_days?: number;
  includes_certificate?: boolean;
  language?: string;
  prerequisites?: string;
}

export const useLMSCourse = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadCourses = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("lms_courses_with_stats")
        .select(`
          *,
          lms_course_modules (count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const coursesWithCount = data?.map((course: any) => ({
        ...course,
        module_count: course.lms_course_modules?.[0]?.count || 0,
      }));
      
      setCourses(coursesWithCount || []);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast({
        title: "Fehler",
        description: "Kurse konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const createCourse = async (courseData: {
    title: string;
    description: string;
    course_type: string;
    price_chf: number;
  }) => {
    try {
      const { error } = await (supabase as any)
        .from("lms_courses")
        .insert([
          {
            ...courseData,
            status: "active",
          },
        ]);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Kurs wurde erstellt",
      });
      
      loadCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Fehler",
        description: "Kurs konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      const { error } = await (supabase as any)
        .from("lms_courses")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Kurs wurde aktualisiert",
      });
      
      loadCourses();
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Fehler",
        description: "Kurs konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("lms_courses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Kurs wurde gelöscht",
      });
      
      loadCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Fehler",
        description: "Kurs konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  return {
    courses,
    loading,
    createCourse,
    updateCourse,
    deleteCourse,
    reload: loadCourses,
  };
};
