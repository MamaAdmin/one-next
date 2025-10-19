import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useLessonTools = (lessonId: string) => {
  const [toolIds, setToolIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      loadTools();
    }
  }, [lessonId]);

  const loadTools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lms_lesson_tools")
        .select("tool_id")
        .eq("lesson_id", lessonId)
        .order("sort_order");

      if (error) throw error;
      setToolIds(data?.map((lt) => lt.tool_id) || []);
    } catch (error) {
      console.error("Error loading lesson tools:", error);
      toast({
        title: "Fehler",
        description: "Lektions-Tools konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTools = async (selectedToolIds: string[]) => {
    try {
      // Delete existing lesson tools
      const { error: deleteError } = await supabase
        .from("lms_lesson_tools")
        .delete()
        .eq("lesson_id", lessonId);

      if (deleteError) throw deleteError;

      // Insert new lesson tools
      if (selectedToolIds.length > 0) {
        const toolsToInsert = selectedToolIds.map((toolId, index) => ({
          lesson_id: lessonId,
          tool_id: toolId,
          sort_order: index + 1,
        }));

        const { error: insertError } = await supabase
          .from("lms_lesson_tools")
          .insert(toolsToInsert);

        if (insertError) throw insertError;
      }

      setToolIds(selectedToolIds);
      toast({
        title: "Erfolg",
        description: "Lektions-Tools wurden gespeichert",
      });
    } catch (error) {
      console.error("Error saving lesson tools:", error);
      toast({
        title: "Fehler",
        description: "Lektions-Tools konnten nicht gespeichert werden",
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
