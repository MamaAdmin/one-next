import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  FramingSessionRow,
  FramingStepRow,
  FramingStepData,
  ChallengeStatementResult,
} from "@/features/framing/types";

const SESSIONS = "framing_sessions";
const STEPS = "framing_steps";

export function useMyFramingSessions() {
  return useQuery({
    queryKey: ["framing", "mine"],
    queryFn: async (): Promise<FramingSessionRow[]> => {
      const { data, error } = await supabase
        .from(SESSIONS)
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as FramingSessionRow[]) ?? [];
    },
  });
}

export function useFramingSession(id: string | undefined) {
  return useQuery({
    queryKey: ["framing", id],
    enabled: !!id,
    queryFn: async (): Promise<FramingSessionRow | null> => {
      const { data, error } = await supabase
        .from(SESSIONS)
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as FramingSessionRow) ?? null;
    },
  });
}

export function useFramingBySprint(sprintId: string | undefined) {
  return useQuery({
    queryKey: ["framing", "by-sprint", sprintId],
    enabled: !!sprintId,
    queryFn: async (): Promise<FramingSessionRow | null> => {
      const { data, error } = await supabase
        .from(SESSIONS)
        .select("*")
        .eq("resulting_sprint_id", sprintId!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as FramingSessionRow) ?? null;
    },
  });
}



export function useFramingSteps(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["framing-steps", sessionId],
    enabled: !!sessionId,
    queryFn: async (): Promise<FramingStepRow[]> => {
      const { data, error } = await supabase
        .from(STEPS)
        .select("*")
        .eq("session_id", sessionId!);
      if (error) throw error;
      return (data as unknown as FramingStepRow[]) ?? [];
    },
  });
}

export function useCreateFramingSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { titel_arbeitstitel: string }): Promise<FramingSessionRow> => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const owner_id = userData.user?.id;
      if (!owner_id) throw new Error("Nicht angemeldet.");
      const { data, error } = await supabase
        .from(SESSIONS)
        .insert({ owner_id, titel_arbeitstitel: input.titel_arbeitstitel })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as FramingSessionRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["framing", "mine"] }),
  });
}

export function useDeleteFramingSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase.from(SESSIONS).delete().eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["framing", "mine"] }),
  });
}


export function useSaveFramingStep(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      step_key: string;
      data: FramingStepData;
      completed?: boolean;
    }) => {
      const payload = [
        {
          session_id: sessionId,
          step_key: args.step_key,
          data: args.data as unknown as Record<string, unknown>,
          completed_at: args.completed ? new Date().toISOString() : null,
        },
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from(STEPS)
        .upsert(payload as any, { onConflict: "session_id,step_key" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["framing-steps", sessionId] }),
  });
}

export function useSetFramingCurrentStep(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (current_step: number) => {
      const { error } = await supabase
        .from(SESSIONS)
        .update({ current_step })
        .eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["framing", sessionId] }),
  });
}

export function useUpdateFramingSession(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Partial<Pick<FramingSessionRow, "titel_arbeitstitel" | "kontext" | "status" | "challenge_statement" | "resulting_sprint_id">>,
    ) => {
      const { error } = await supabase.from(SESSIONS).update(input).eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["framing", sessionId] });
      qc.invalidateQueries({ queryKey: ["framing", "mine"] });
    },
  });
}

export function useFramingSuggest() {
  return useMutation({
    mutationFn: async (args: {
      session_id: string;
      step_key: string;
      field?: string;
    }): Promise<{ vorschlaege: string[] }> => {
      const { data, error } = await supabase.functions.invoke("framing-ai-suggest", {
        body: args,
      });
      if (error) throw error;
      return data as { vorschlaege: string[] };
    },
  });
}

export function useGenerateChallenge() {
  return useMutation({
    mutationFn: async (args: { session_id: string }): Promise<ChallengeStatementResult> => {
      const { data, error } = await supabase.functions.invoke("framing-generate-challenge", {
        body: args,
      });
      if (error) throw error;
      return data as ChallengeStatementResult;
    },
  });
}
