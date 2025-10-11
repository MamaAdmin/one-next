import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LMSModule {
  id: string;
  course_id: string;
  phase_number: number;
  title: string;
  description: string | null;
  module_type: string;
  duration_minutes: number;
  sort_order: number;
  config: any;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

interface ModuleProgress {
  id: string;
  enrollment_id: string;
  module_id: string;
  status: "not_started" | "in_progress" | "completed" | "blocked";
  started_at: string | null;
  completed_at: string | null;
  time_spent_minutes: number;
  data: any;
}

export const useLMSModules = (courseId: string, enrollmentId?: string) => {
  const [modules, setModules] = useState<LMSModule[]>([]);
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load modules
        const { data: modulesData, error: modulesError } = await supabase
          .from("lms_course_modules")
          .select("*")
          .eq("course_id", courseId)
          .order("phase_number", { ascending: true })
          .order("sort_order", { ascending: true });

        if (modulesError) throw modulesError;
        setModules(modulesData || []);

        // Load progress if enrollmentId provided
        if (enrollmentId) {
          const { data: progressData, error: progressError } = await supabase
            .from("lms_module_progress")
            .select("*")
            .eq("enrollment_id", enrollmentId);

          if (progressError) throw progressError;

          const progressMap: Record<string, ModuleProgress> = {};
          progressData?.forEach(p => {
            progressMap[p.module_id] = p;
          });
          setProgress(progressMap);
        }
      } catch (error) {
        console.error("Error loading modules:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadData();
    }

    // Realtime updates for progress
    if (enrollmentId) {
      const channel = supabase
        .channel(`module-progress-${enrollmentId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "lms_module_progress",
            filter: `enrollment_id=eq.${enrollmentId}`
          },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const newProgress = payload.new as ModuleProgress;
              setProgress(prev => ({
                ...prev,
                [newProgress.module_id]: newProgress
              }));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [courseId, enrollmentId]);

  const updateProgress = async (
    moduleId: string,
    updates: Partial<ModuleProgress>
  ) => {
    if (!enrollmentId) throw new Error("No enrollment ID provided");

    try {
      const existingProgress = progress[moduleId];

      if (existingProgress) {
        const { error } = await supabase
          .from("lms_module_progress")
          .update(updates)
          .eq("id", existingProgress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lms_module_progress")
          .insert({
            enrollment_id: enrollmentId,
            module_id: moduleId,
            ...updates
          });

        if (error) throw error;
      }

      // Recalculate enrollment progress
      await supabase.rpc("calculate_enrollment_progress", {
        p_enrollment_id: enrollmentId
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  };

  const startModule = async (moduleId: string) => {
    await updateProgress(moduleId, {
      status: "in_progress",
      started_at: new Date().toISOString()
    });
  };

  const completeModule = async (moduleId: string, data?: any) => {
    await updateProgress(moduleId, {
      status: "completed",
      completed_at: new Date().toISOString(),
      data: data || {}
    });
  };

  return {
    modules,
    progress,
    loading,
    updateProgress,
    startModule,
    completeModule
  };
};
