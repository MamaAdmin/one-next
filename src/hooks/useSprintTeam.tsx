import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  SprintInvitationRow,
  SprintMemberRow,
  SprintTeamRole,
} from "@/features/sprint/types";

/* ------------------------------ Members ------------------------------ */

export function useSprintMembers(sprintId: string | undefined) {
  return useQuery({
    queryKey: ["sprint-team", "members", sprintId],
    enabled: !!sprintId,
    queryFn: async (): Promise<SprintMemberRow[]> => {
      const { data, error } = await supabase
        .from("sprint_members")
        .select("*")
        .eq("sprint_id", sprintId!);
      if (error) throw error;
      return (data as unknown as SprintMemberRow[]) ?? [];
    },
  });
}

export function useAddSelfAsMember(sprintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rolle: SprintTeamRole) => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user_id = userData.user?.id;
      if (!user_id) throw new Error("Nicht angemeldet.");
      const email = userData.user?.email ?? null;
      const { error } = await supabase
        .from("sprint_members")
        .upsert(
          { sprint_id: sprintId, user_id, email, rolle },
          { onConflict: "sprint_id,user_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sprint-team", "members", sprintId] }),
  });
}

export function useRemoveSprintMember(sprintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from("sprint_members").delete().eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sprint-team", "members", sprintId] }),
  });
}

/* ---------------------------- Invitations ---------------------------- */

export function useSprintInvitations(sprintId: string | undefined) {
  return useQuery({
    queryKey: ["sprint-team", "invites", sprintId],
    enabled: !!sprintId,
    queryFn: async (): Promise<SprintInvitationRow[]> => {
      const { data, error } = await supabase
        .from("sprint_invitations")
        .select("*")
        .eq("sprint_id", sprintId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as SprintInvitationRow[]) ?? [];
    },
  });
}

function randomToken(): string {
  // 32-char url-safe token
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function useCreateSprintInvitation(sprintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; full_name: string; role_type: SprintTeamRole }) => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const invited_by = userData.user?.id;
      if (!invited_by) throw new Error("Nicht angemeldet.");

      const token = randomToken();
      const { data, error } = await supabase
        .from("sprint_invitations")
        .insert({
          sprint_id: sprintId,
          email: input.email.trim().toLowerCase(),
          full_name: input.full_name.trim(),
          role_type: input.role_type,
          token,
          invited_by,
        })
        .select("*")
        .single();
      if (error) throw error;

      // Fire-and-log: send email via edge function. Failures don't block the invite row.
      try {
        await supabase.functions.invoke("send-sprint-team-invite", {
          body: { invitation_id: (data as { id: string }).id, origin: window.location.origin },
        });
      } catch {
        // swallow — user can resend later
      }
      return data as unknown as SprintInvitationRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sprint-team", "invites", sprintId] }),
  });
}

export function useResendSprintInvitation(sprintId: string) {
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase.functions.invoke("send-sprint-team-invite", {
        body: { invitation_id: invitationId, origin: window.location.origin },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void sprintId; // keep signature aligned
    },
  });
}

export function useRevokeSprintInvitation(sprintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase.from("sprint_invitations").delete().eq("id", invitationId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sprint-team", "invites", sprintId] }),
  });
}
