import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MiroConnectionRow {
  user_id: string;
  miro_name: string | null;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface SprintMiroBoardRow {
  id: string;
  sprint_id: string;
  step_key: string;
  board_id: string;
  board_url: string;
  embed_url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useMiroConnection() {
  return useQuery({
    queryKey: ["miro", "connection"],
    queryFn: async (): Promise<MiroConnectionRow | null> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase
        .from("miro_connections")
        .select("user_id, miro_name, token_expires_at, created_at, updated_at")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) throw error;
      return (data as MiroConnectionRow | null) ?? null;
    },
  });
}

export function useConnectMiro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const origin = window.location.origin;
      const { data, error } = await supabase.functions.invoke("miro-oauth-start", {
        body: { origin },
      });
      if (error) throw error;
      const authorizeUrl = (data as { authorize_url?: string })?.authorize_url;
      if (!authorizeUrl) throw new Error("Konnte Miro-Authorize-URL nicht laden.");
      const popup = window.open(
        authorizeUrl,
        "miro-oauth",
        "width=600,height=800,left=200,top=100",
      );
      if (!popup) throw new Error("Popup wurde blockiert. Bitte Popups für diese Seite erlauben.");
      await new Promise<void>((resolve, reject) => {
        const timer = window.setInterval(() => {
          if (popup.closed) {
            window.clearInterval(timer);
            window.removeEventListener("message", onMessage);
            reject(new Error("Fenster wurde geschlossen, bevor die Verbindung abgeschlossen war."));
          }
        }, 500);
        function onMessage(e: MessageEvent) {
          if (e.origin !== origin) return;
          const payload = e.data as { type?: string; ok?: boolean; error?: string } | null;
          if (payload?.type !== "miro-oauth") return;
          window.clearInterval(timer);
          window.removeEventListener("message", onMessage);
          if (payload.ok) resolve();
          else reject(new Error(payload.error ?? "Verbindung fehlgeschlagen."));
        }
        window.addEventListener("message", onMessage);
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["miro"] });
    },
  });
}

export function useDisconnectMiro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Nicht angemeldet.");
      const { error } = await supabase.from("miro_connections").delete().eq("user_id", uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["miro"] }),
  });
}

export function useSprintMiroBoard(sprintId: string | undefined, stepKey: string) {
  return useQuery({
    queryKey: ["miro", "board", sprintId, stepKey],
    enabled: !!sprintId,
    queryFn: async (): Promise<SprintMiroBoardRow | null> => {
      const { data, error } = await supabase
        .from("sprint_miro_boards")
        .select("*")
        .eq("sprint_id", sprintId!)
        .eq("step_key", stepKey)
        .maybeSingle();
      if (error) throw error;
      return (data as SprintMiroBoardRow | null) ?? null;
    },
  });
}

export function useCreateCrazy8Board(sprintId: string, stepKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<SprintMiroBoardRow> => {
      const { data, error } = await supabase.functions.invoke("miro-create-crazy8-board", {
        body: { sprint_id: sprintId, step_key: stepKey },
      });
      if (error) throw error;
      const payload = data as { board?: SprintMiroBoardRow; error?: string; details?: string };
      if (payload?.error) throw new Error(payload.details ?? payload.error);
      if (!payload?.board) throw new Error("Kein Board zurückgegeben.");
      return payload.board;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["miro", "board", sprintId, stepKey] }),
  });
}

export function useFetchMiroItems(sprintId: string, stepKey: string) {
  return useMutation({
    mutationFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.functions.invoke("miro-fetch-board-items", {
        body: { sprint_id: sprintId, step_key: stepKey },
      });
      if (error) throw error;
      const payload = data as { items?: string[]; error?: string; details?: string };
      if (payload?.error) throw new Error(payload.details ?? payload.error);
      return payload.items ?? [];
    },
  });
}
