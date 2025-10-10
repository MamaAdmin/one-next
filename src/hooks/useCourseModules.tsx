import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CourseModule {
  id: string;
  course_id: string;
  phase_number: number;
  title: string;
  description: string;
  module_type: string;
  order_index: number;
  config: any;
  external_tool: string | null;
  external_tool_config: any;
  is_required: boolean;
}

export const useCourseModules = (courseId?: string) => {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      loadModules();
    }
  }, [courseId]);

  const loadModules = async () => {
    if (!courseId) return;

    try {
      const { data, error } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId)
        .order("phase_number")
        .order("order_index");

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error("Error loading modules:", error);
      toast({
        title: "Fehler",
        description: "Module konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getModulesByPhase = (phase: number) => {
    return modules.filter((m) => m.phase_number === phase);
  };

  const createModule = async (moduleData: Partial<CourseModule>) => {
    try {
      const { data, error } = await supabase
        .from("course_modules")
        .insert([{ ...moduleData, course_id: courseId }])
        .select()
        .single();

      if (error) throw error;
      
      toast({ title: "Erfolg", description: "Modul erstellt" });
      loadModules();
      return data;
    } catch (error) {
      console.error("Error creating module:", error);
      toast({
        title: "Fehler",
        description: "Modul konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const updateModule = async (id: string, updates: Partial<CourseModule>) => {
    try {
      const { error } = await supabase
        .from("course_modules")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Erfolg", description: "Modul aktualisiert" });
      loadModules();
    } catch (error) {
      console.error("Error updating module:", error);
      toast({
        title: "Fehler",
        description: "Modul konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  const deleteModule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("course_modules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Erfolg", description: "Modul gelöscht" });
      loadModules();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast({
        title: "Fehler",
        description: "Modul konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  return {
    modules,
    loading,
    getModulesByPhase,
    createModule,
    updateModule,
    deleteModule,
    reload: loadModules,
  };
};
