import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Version {
  id: string;
  content_type: string;
  content_id: string;
  version_number: number;
  content: any;
  changed_by: string;
  change_summary: string | null;
  created_at: string;
}

export const useVersionHistory = (contentType: string, contentId: string) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchVersions = async () => {
    if (!contentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_versions")
        .select("*")
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error("Error fetching versions:", error);
      toast({
        title: "Fehler",
        description: "Versionen konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = async (versionId: string) => {
    try {
      const version = versions.find((v) => v.id === versionId);
      if (!version) throw new Error("Version not found");

      const { error } = await supabase
        .from(contentType as any)
        .update(version.content as any)
        .eq("id", contentId);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Version erfolgreich wiederhergestellt",
      });

      return true;
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Fehler",
        description: "Version konnte nicht wiederhergestellt werden",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [contentType, contentId]);

  return {
    versions,
    loading,
    fetchVersions,
    restoreVersion,
  };
};
