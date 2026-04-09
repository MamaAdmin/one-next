import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PublicCourseModule {
  id: string;
  course_id: string;
  sort_order: number;
  title: string;
  module_type: string;
  content_html: string | null;
  items: any[] | null;
  youtube_url: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export const usePublicCourseModules = (courseId: string | null) => {
  const [modules, setModules] = useState<PublicCourseModule[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadModules = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("public_course_modules")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setModules((data || []) as PublicCourseModule[]);
    } catch (error) {
      console.error("Error loading modules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, [courseId]);

  const addModule = async (moduleData: Partial<PublicCourseModule>) => {
    try {
      const { error } = await supabase
        .from("public_course_modules")
        .insert([{ ...moduleData, course_id: courseId } as any]);

      if (error) throw error;
      toast({ title: "Erfolg", description: "Modul wurde hinzugefügt" });
      loadModules();
    } catch (error) {
      console.error("Error adding module:", error);
      toast({ title: "Fehler", description: "Modul konnte nicht hinzugefügt werden", variant: "destructive" });
    }
  };

  const updateModule = async (id: string, updates: Partial<PublicCourseModule>) => {
    try {
      const { error } = await supabase
        .from("public_course_modules")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Erfolg", description: "Modul wurde aktualisiert" });
      loadModules();
    } catch (error) {
      console.error("Error updating module:", error);
      toast({ title: "Fehler", description: "Modul konnte nicht aktualisiert werden", variant: "destructive" });
    }
  };

  const deleteModule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("public_course_modules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Erfolg", description: "Modul wurde gelöscht" });
      loadModules();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast({ title: "Fehler", description: "Modul konnte nicht gelöscht werden", variant: "destructive" });
    }
  };

  return { modules, loading, addModule, updateModule, deleteModule, reload: loadModules };
};
