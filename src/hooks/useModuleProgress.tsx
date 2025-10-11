import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ModuleProgress {
  id: string;
  enrollment_id: string;
  module_id: string;
  status: "not_started" | "in_progress" | "completed";
  data: any;
  completed_at: string | null;
}

export const useModuleProgress = (enrollmentId?: string) => {
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (enrollmentId) {
      loadProgress();
    }
  }, [enrollmentId]);

  const loadProgress = async () => {
    if (!enrollmentId) return;

    try {
      const { data, error } = await (supabase as any)
        .from("lms_module_progress")
        .select("*")
        .eq("enrollment_id", enrollmentId);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error("Error loading progress:", error);
      toast({
        title: "Fehler",
        description: "Fortschritt konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getModuleProgress = (moduleId: string): ModuleProgress | null => {
    return progress.find((p) => p.module_id === moduleId) || null;
  };

  const updateProgress = async (
    moduleId: string,
    status: ModuleProgress["status"],
    data: any
  ) => {
    if (!enrollmentId) return;

    try {
      const existingProgress = getModuleProgress(moduleId);

      if (existingProgress) {
        // Update existing
        const { error } = await (supabase as any)
          .from("lms_module_progress")
          .update({
            status,
            data,
            completed_at: status === "completed" ? new Date().toISOString() : null,
          })
          .eq("id", existingProgress.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await (supabase as any).from("lms_module_progress").insert([
          {
            enrollment_id: enrollmentId,
            module_id: moduleId,
            status,
            data,
            completed_at: status === "completed" ? new Date().toISOString() : null,
          },
        ]);

        if (error) throw error;
      }

      loadProgress();
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Fehler",
        description: "Fortschritt konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const markModuleComplete = async (moduleId: string) => {
    const moduleProgress = getModuleProgress(moduleId);
    if (moduleProgress) {
      await updateProgress(moduleId, "completed", moduleProgress.data);
    }
  };

  return {
    progress,
    loading,
    getModuleProgress,
    updateProgress,
    markModuleComplete,
    reload: loadProgress,
  };
};
