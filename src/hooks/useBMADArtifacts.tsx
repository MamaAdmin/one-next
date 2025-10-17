import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BMADArtifact = {
  id: string;
  session_id: string;
  agent_type: "business_analyst" | "manager" | "architect" | "developer";
  artifact_type: "requirements" | "architecture" | "code" | "deployment";
  title: string;
  content: string;
  metadata: any;
  version: number;
  parent_artifact_id: string | null;
  is_approved: boolean | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export const useBMADArtifacts = (sessionId?: string) => {
  const { data: artifacts, isLoading, error } = useQuery({
    queryKey: sessionId ? ["bmad-artifacts", sessionId] : ["bmad-artifacts"],
    queryFn: async () => {
      let query = supabase
        .from("bmad_artifacts" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (sessionId) {
        query = query.eq("session_id", sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as BMADArtifact[];
    },
  });

  return {
    artifacts: artifacts || [],
    isLoading,
    error,
  };
};

export const downloadArtifact = (artifact: BMADArtifact) => {
  const dataStr = JSON.stringify(artifact, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  const exportFileDefaultName = `${artifact.title.replace(/\s+/g, "_")}_v${artifact.version}.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};
