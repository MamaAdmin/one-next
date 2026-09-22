import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FramingStepLite } from "@/features/sprint/framingSeed";

export interface FramingForSprint {
  sessionId: string;
  steps: FramingStepLite[];
}

/**
 * Lädt die mit einem Sprint verknüpfte Problem-Framing-Session inkl. Schritten.
 * Verknüpfung: framing_sessions.resulting_sprint_id -> sprints.id
 */
export function useFramingForSprint(sprintId: string | undefined) {
  return useQuery({
    queryKey: ["framing-for-sprint", sprintId],
    enabled: !!sprintId,
    staleTime: 60_000,
    queryFn: async (): Promise<FramingForSprint | null> => {
      const { data: session, error } = await supabase
        .from("framing_sessions")
        .select("id")
        .eq("resulting_sprint_id", sprintId!)
        .maybeSingle();
      if (error) throw error;
      if (!session) return null;
      const { data: steps, error: stepsError } = await supabase
        .from("framing_steps")
        .select("step_key,data")
        .eq("session_id", session.id);
      if (stepsError) throw stepsError;
      return {
        sessionId: session.id,
        steps: (steps ?? []) as unknown as FramingStepLite[],
      };
    },
  });
}
