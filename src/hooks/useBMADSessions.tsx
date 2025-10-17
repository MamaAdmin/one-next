import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BMADSession = {
  id: string;
  title: string;
  description: string | null;
  project_context: string | null;
  status: "planning" | "development" | "completed";
  current_phase: string;
  created_by: string;
  planning_completed_at: string | null;
  development_started_at: string | null;
  settings: any;
  created_at: string;
  updated_at: string;
};

export const useBMADSessions = () => {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ["bmad-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bmad_sessions" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as BMADSession[];
    },
  });

  const { mutate: updateSession } = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<BMADSession>;
    }) => {
      const { error } = await supabase
        .from("bmad_sessions" as any)
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bmad-sessions"] });
      toast.success("Session aktualisiert");
    },
    onError: (error) => {
      toast.error("Fehler beim Aktualisieren der Session");
      console.error(error);
    },
  });

  return {
    sessions: sessions || [],
    isLoading,
    error,
    updateSession,
  };
};

export const useBMADSession = (sessionId: string) => {
  const { data: session, isLoading, error } = useQuery({
    queryKey: ["bmad-session", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bmad_sessions" as any)
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      return data as unknown as BMADSession;
    },
    enabled: !!sessionId,
  });

  return {
    session,
    isLoading,
    error,
  };
};
