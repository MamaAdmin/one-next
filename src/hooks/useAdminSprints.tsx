import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SprintRow, SprintStepRow } from "@/features/sprint/types";

export interface AdminSprintProfile {
  id: string;
  email: string | null;
  full_name: string | null;
}

export interface AdminSprintRow extends SprintRow {
  owner: AdminSprintProfile | null;
  member_count: number;
}

async function fetchProfiles(ids: string[]): Promise<Record<string, AdminSprintProfile>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return {};
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name")
    .in("id", unique);
  if (error) throw error;
  const map: Record<string, AdminSprintProfile> = {};
  (data ?? []).forEach((p) => {
    map[p.id] = p as AdminSprintProfile;
  });
  return map;
}

export function useAdminAllSprints(options?: { deletedOnly?: boolean }) {
  const deletedOnly = !!options?.deletedOnly;
  return useQuery({
    queryKey: ["admin", "sprints", "all", deletedOnly ? "deleted" : "active"],
    queryFn: async (): Promise<AdminSprintRow[]> => {
      let query = supabase
        .from("sprints")
        .select("*")
        .order("created_at", { ascending: false });
      query = deletedOnly
        ? query.not("deleted_at", "is", null)
        : query.is("deleted_at", null);
      const { data: sprints, error } = await query;
      if (error) throw error;

      const rows = (sprints ?? []) as unknown as SprintRow[];
      const ownerIds = rows.map((r) => r.owner_id);
      const profiles = await fetchProfiles(ownerIds);

      const { data: members, error: memErr } = await supabase
        .from("sprint_members")
        .select("sprint_id");
      if (memErr) throw memErr;
      const counts: Record<string, number> = {};
      (members ?? []).forEach((m: { sprint_id: string }) => {
        counts[m.sprint_id] = (counts[m.sprint_id] ?? 0) + 1;
      });

      return rows.map((r) => ({
        ...r,
        owner: profiles[r.owner_id] ?? null,
        member_count: counts[r.id] ?? 0,
      }));
    },
  });
}

export function useRestoreSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sprintId: string) => {
      const { error } = await supabase
        .from("sprints")
        .update({ deleted_at: null })
        .eq("id", sprintId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "sprints"] });
      qc.invalidateQueries({ queryKey: ["sprints", "mine"] });
    },
  });
}

export interface AdminSprintMember {
  id: string;
  sprint_id: string;
  user_id: string | null;
  email: string | null;
  rolle: string;
  profile: AdminSprintProfile | null;
}

export interface AdminSprintDetail {
  sprint: AdminSprintRow;
  steps: SprintStepRow[];
  members: AdminSprintMember[];
}

export function useAdminSprintDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "sprints", "detail", id],
    enabled: !!id,
    queryFn: async (): Promise<AdminSprintDetail | null> => {
      const { data: sprint, error } = await supabase
        .from("sprints")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      if (!sprint) return null;

      const [{ data: steps, error: stepErr }, { data: members, error: memErr }] =
        await Promise.all([
          supabase.from("sprint_steps").select("*").eq("sprint_id", id!),
          supabase.from("sprint_members").select("*").eq("sprint_id", id!),
        ]);
      if (stepErr) throw stepErr;
      if (memErr) throw memErr;

      const memberList = (members ?? []) as Array<{
        id: string;
        sprint_id: string;
        user_id: string | null;
        email: string | null;
        rolle: string;
      }>;

      const profileIds: string[] = [
        (sprint as unknown as SprintRow).owner_id,
        ...memberList.map((m) => m.user_id).filter((u): u is string => !!u),
      ];
      const profiles = await fetchProfiles(profileIds);
      const s = sprint as unknown as SprintRow;

      return {
        sprint: {
          ...s,
          owner: profiles[s.owner_id] ?? null,
          member_count: memberList.length,
        },
        steps: (steps ?? []) as unknown as SprintStepRow[],
        members: memberList.map((m) => ({
          ...m,
          profile: m.user_id ? profiles[m.user_id] ?? null : null,
        })),
      };
    },
  });
}

export interface AdminFramingRow {
  id: string;
  owner_id: string;
  titel_arbeitstitel: string;
  status: "active" | "done" | "archived";
  current_step: number;
  challenge_statement: string | null;
  resulting_sprint_id: string | null;
  created_at: string;
  updated_at: string;
  owner: AdminSprintProfile | null;
  member_count: number;
}

export function useAdminAllFramingSessions() {
  return useQuery({
    queryKey: ["admin", "framing", "all"],
    queryFn: async (): Promise<AdminFramingRow[]> => {
      const { data: sessions, error } = await supabase
        .from("framing_sessions")
        .select("id,owner_id,titel_arbeitstitel,status,current_step,challenge_statement,resulting_sprint_id,created_at,updated_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (sessions ?? []) as Array<Omit<AdminFramingRow, "owner" | "member_count">>;
      const profiles = await fetchProfiles(rows.map((r) => r.owner_id));
      const { data: members, error: memErr } = await supabase
        .from("framing_members")
        .select("session_id");
      if (memErr) throw memErr;
      const counts: Record<string, number> = {};
      (members ?? []).forEach((m: { session_id: string }) => {
        counts[m.session_id] = (counts[m.session_id] ?? 0) + 1;
      });
      return rows.map((r) => ({
        ...r,
        owner: profiles[r.owner_id] ?? null,
        member_count: counts[r.id] ?? 0,
      }));
    },
  });
}
