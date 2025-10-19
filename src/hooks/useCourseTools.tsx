import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useCourseTools = (courseId: string) => {
  const [toolIds, setToolIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadTools();
    }
  }, [courseId]);

  const loadTools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lms_course_tools")
        .select("tool_id")
        .eq("course_id", courseId)
        .order("sort_order");

      if (error) throw error;
      setToolIds(data?.map((ct) => ct.tool_id) || []);
    } catch (error) {
      console.error("Error loading course tools:", error);
      toast({
        title: "Fehler",
        description: "Kurs-Tools konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTools = async (selectedToolIds: string[]) => {
    try {
      // Delete existing course tools
      const { error: deleteError } = await supabase
        .from("lms_course_tools")
        .delete()
        .eq("course_id", courseId);

      if (deleteError) throw deleteError;

      // Insert new course tools
      if (selectedToolIds.length > 0) {
        const toolsToInsert = selectedToolIds.map((toolId, index) => ({
          course_id: courseId,
          tool_id: toolId,
          sort_order: index + 1,
        }));

        const { error: insertError } = await supabase
          .from("lms_course_tools")
          .insert(toolsToInsert);

        if (insertError) throw insertError;
      }

      setToolIds(selectedToolIds);
      toast({
        title: "Erfolg",
        description: "Kurs-Tools wurden gespeichert",
      });
    } catch (error) {
      console.error("Error saving course tools:", error);
      toast({
        title: "Fehler",
        description: "Kurs-Tools konnten nicht gespeichert werden",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    toolIds,
    loading,
    saveTools,
    loadTools,
  };
};
