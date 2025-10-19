import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  lesson_type: string;
  content_text: string | null;
  content_video_url: string | null;
  duration_minutes: number;
  sort_order: number;
  is_required: boolean;
  is_locked: boolean;
}

interface LessonProgress {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  is_completed: boolean;
  started_at: string | null;
  completed_at: string | null;
  time_spent_minutes: number;
}

export const useLMSLessons = (moduleId: string, enrollmentId?: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lms_lessons")
          .select("*")
          .eq("module_id", moduleId)
          .order("sort_order", { ascending: true });

        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);

        if (enrollmentId) {
          const { data: progressData, error: progressError } = await supabase
            .from("lms_lesson_progress")
            .select("*")
            .eq("enrollment_id", enrollmentId);

          if (progressError) throw progressError;

          const progressMap: Record<string, LessonProgress> = {};
          progressData?.forEach(p => {
            progressMap[p.lesson_id] = p;
          });
          setProgress(progressMap);
        }
      } catch (error) {
        console.error("Error loading lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      loadData();
    }
  }, [moduleId, enrollmentId]);

  const completeLesson = async (lessonId: string) => {
    if (!enrollmentId) throw new Error("No enrollment ID provided");

    try {
      const existingProgress = progress[lessonId];

      if (existingProgress) {
        const { error } = await supabase
          .from("lms_lesson_progress")
          .update({
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq("id", existingProgress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lms_lesson_progress")
          .insert({
            enrollment_id: enrollmentId,
            lesson_id: lessonId,
            is_completed: true,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      setProgress(prev => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          is_completed: true,
          completed_at: new Date().toISOString()
        } as LessonProgress
      }));
    } catch (error) {
      console.error("Error completing lesson:", error);
      throw error;
    }
  };

  return {
    lessons,
    progress,
    loading,
    completeLesson
  };
};
