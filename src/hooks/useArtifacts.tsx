import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Artifact {
  id: string;
  enrollment_id: string;
  module_id: string;
  file_path: string;
  file_type: string;
  title: string;
  description?: string;
  created_at: string;
}

export const useArtifacts = (enrollmentId?: string, moduleId?: string) => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadArtifacts = async () => {
    if (!enrollmentId) {
      setLoading(false);
      return;
    }

    try {
      let query = (supabase as any)
        .from("lms_artifacts")
        .select("*")
        .eq("enrollment_id", enrollmentId);

      if (moduleId) {
        query = query.eq("module_id", moduleId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setArtifacts(data || []);
    } catch (error) {
      console.error("Error loading artifacts:", error);
      toast({
        title: "Fehler",
        description: "Artifacts konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtifacts();
  }, [enrollmentId, moduleId]);

  const uploadArtifact = async (
    file: File,
    moduleId: string,
    title: string,
    description?: string
  ) => {
    if (!enrollmentId) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${enrollmentId}/${moduleId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("lms-artifacts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await (supabase as any)
        .from("lms_artifacts")
        .insert([
          {
            enrollment_id: enrollmentId,
            module_id: moduleId,
            file_path: fileName,
            file_type: file.type,
            title,
            description,
          },
        ]);

      if (dbError) throw dbError;

      toast({
        title: "Erfolg",
        description: "Artifact wurde hochgeladen",
      });

      loadArtifacts();
    } catch (error: any) {
      console.error("Error uploading artifact:", error);
      toast({
        title: "Fehler",
        description: error.message || "Artifact konnte nicht hochgeladen werden",
        variant: "destructive",
      });
    }
  };

  const deleteArtifact = async (id: string, filePath: string) => {
    try {
      await supabase.storage.from("lms-artifacts").remove([filePath]);

      const { error } = await (supabase as any)
        .from("lms_artifacts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Artifact wurde gelöscht",
      });

      loadArtifacts();
    } catch (error) {
      console.error("Error deleting artifact:", error);
      toast({
        title: "Fehler",
        description: "Artifact konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const getArtifactUrl = (filePath: string) => {
    const { data } = supabase.storage.from("lms-artifacts").getPublicUrl(filePath);
    return data.publicUrl;
  };

  return {
    artifacts,
    loading,
    uploadArtifact,
    deleteArtifact,
    getArtifactUrl,
    reload: loadArtifacts,
  };
};
