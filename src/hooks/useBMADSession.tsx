import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BMADSession {
  id: string;
  title: string;
  description: string | null;
  project_context: string | null;
  status: 'planning' | 'development' | 'completed' | 'archived';
  created_by: string;
  current_phase: string;
  planning_completed_at: string | null;
  development_started_at: string | null;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface BMADArtifact {
  id: string;
  session_id: string;
  agent_type: string;
  artifact_type: string;
  title: string;
  content: string;
  metadata: any;
  version: number;
  parent_artifact_id: string | null;
  is_approved: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BMADConversation {
  id: string;
  session_id: string;
  agent_type: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  created_at: string;
}

export const useBMADSession = (sessionId: string | undefined) => {
  const [session, setSession] = useState<BMADSession | null>(null);
  const [artifacts, setArtifacts] = useState<BMADArtifact[]>([]);
  const [conversations, setConversations] = useState<BMADConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);

      const { data: sessionData, error: sessionError } = await supabase
        .from("bmad_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;

      const { data: artifactsData, error: artifactsError } = await supabase
        .from("bmad_artifacts")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (artifactsError) throw artifactsError;

      const { data: conversationsData, error: conversationsError } = await supabase
        .from("bmad_conversations")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (conversationsError) throw conversationsError;

      setSession(sessionData);
      setArtifacts(artifactsData || []);
      setConversations((conversationsData as BMADConversation[]) || []);
    } catch (error: any) {
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runAgent = async (agentType: string, userInput?: string, autoProgress: boolean = false) => {
    if (!sessionId) return null;

    try {
      setIsRunning(true);
      
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) {
        throw new Error("Nicht authentifiziert");
      }

      const response = await supabase.functions.invoke("bmad-orchestrator", {
        body: {
          sessionId,
          agentType,
          userInput,
          autoProgress,
        },
        headers: {
          Authorization: `Bearer ${authSession.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Agent erfolgreich ausgeführt",
        description: `${agentType.replace(/_/g, ' ')} hat die Analyse abgeschlossen.`,
      });

      await loadSession();
      return response.data;
    } catch (error: any) {
      toast({
        title: "Fehler beim Ausführen des Agenten",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  const generateStoryFiles = async () => {
    if (!sessionId) return null;

    try {
      setIsRunning(true);

      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) {
        throw new Error("Nicht authentifiziert");
      }

      const response = await supabase.functions.invoke("bmad-story-generator", {
        body: { sessionId },
        headers: {
          Authorization: `Bearer ${authSession.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Story Files generiert",
        description: "Developer Story Files wurden erfolgreich erstellt.",
      });

      await loadSession();
      return response.data;
    } catch (error: any) {
      toast({
        title: "Fehler bei Story-Generierung",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  const flattenRepo = async () => {
    if (!sessionId) return null;

    try {
      setIsRunning(true);

      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) {
        throw new Error("Nicht authentifiziert");
      }

      const response = await supabase.functions.invoke("bmad-repo-flattener", {
        body: { sessionId },
        headers: {
          Authorization: `Bearer ${authSession.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Repository analysiert",
        description: "Repository-Übersicht wurde erstellt.",
      });

      await loadSession();
      return response.data;
    } catch (error: any) {
      toast({
        title: "Fehler bei Repository-Analyse",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  return {
    session,
    artifacts,
    conversations,
    loading,
    isRunning,
    runAgent,
    generateStoryFiles,
    flattenRepo,
    refresh: loadSession,
  };
};
