import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SprintRow, SprintStepRow, SprintStepData } from "@/features/sprint/types";

const SPRINTS_TABLE = "sprints";
const STEPS_TABLE = "sprint_steps";

/* ---------------------------------- Lists ---------------------------------- */

export function useMySprints() {
  return useQuery({
    queryKey: ["sprints", "mine"],
    queryFn: async (): Promise<SprintRow[]> => {
      const { data, error } = await supabase
        .from(SPRINTS_TABLE)
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as SprintRow[]) ?? [];
    },
  });
}

export function useSprint(id: string | undefined) {
  return useQuery({
    queryKey: ["sprints", id],
    enabled: !!id,
    queryFn: async (): Promise<SprintRow | null> => {
      const { data, error } = await supabase
        .from(SPRINTS_TABLE)
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as SprintRow) ?? null;
    },
  });
}

export function useSprintSteps(sprintId: string | undefined) {
  return useQuery({
    queryKey: ["sprint-steps", sprintId],
    enabled: !!sprintId,
    queryFn: async (): Promise<SprintStepRow[]> => {
      const { data, error } = await supabase
        .from(STEPS_TABLE)
        .select("*")
        .eq("sprint_id", sprintId!);
      if (error) throw error;
      return (data as unknown as SprintStepRow[]) ?? [];
    },
  });
}

/* -------------------------------- Mutations -------------------------------- */

export interface CreateSprintInput {
  titel: string;
  problemstellung: string;
  modus: "solo" | "team";
  decider: string;
  sprint_leader: string;
}

export function useCreateSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSprintInput): Promise<SprintRow> => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const owner_id = userData.user?.id;
      if (!owner_id) throw new Error("Nicht angemeldet.");

      const { data, error } = await supabase
        .from(SPRINTS_TABLE)
        .insert({ ...input, owner_id })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as SprintRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints", "mine"] });
    },
  });
}

export function useSaveStep(sprintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      step_key: string;
      data: SprintStepData;
      completed?: boolean;
    }) => {
      const payload = [
        {
          sprint_id: sprintId,
          step_key: args.step_key,
          data: args.data as unknown as Record<string, unknown>,
          completed_at: args.completed ? new Date().toISOString() : null,
        },
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from(STEPS_TABLE)
        .upsert(payload as any, { onConflict: "sprint_id,step_key" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprint-steps", sprintId] });
    },
  });
}

export function useSetCurrentStep(sprintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (step_key: string) => {
      const { error } = await supabase
        .from(SPRINTS_TABLE)
        .update({ current_step: step_key })
        .eq("id", sprintId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints", sprintId] });
    },
  });
}
