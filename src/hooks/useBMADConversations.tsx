import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BMADConversation = {
  id: string;
  session_id: string;
  agent_type: "business_analyst" | "manager" | "architect" | "developer";
  role: string;
  content: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  created_at: string;
};

export const useBMADConversations = (sessionId: string) => {
  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ["bmad-conversations", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bmad_conversations" as any)
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as unknown as BMADConversation[];
    },
    enabled: !!sessionId,
  });

  const totalTokens = conversations?.reduce(
    (acc, conv) => ({
      prompt: acc.prompt + (conv.prompt_tokens || 0),
      completion: acc.completion + (conv.completion_tokens || 0),
    }),
    { prompt: 0, completion: 0 }
  ) || { prompt: 0, completion: 0 };

  return {
    conversations: conversations || [],
    totalTokens,
    isLoading,
    error,
  };
};
