import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VIDEO_SLOTS, type VideoSlotDef } from "@/features/video/slots";

export type PlacementPosition = "top" | "bottom";

export interface VideoPlacement {
  id: string;
  slot_key: string;
  label: string;
  page_path: string;
  position: PlacementPosition;
}

const KEY = ["video-placements"];

export function useVideoPlacements() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<VideoPlacement[]> => {
      const { data, error } = await supabase.from("video_placements").select("*").order("created_at");
      if (error) throw error;
      return (data ?? []) as VideoPlacement[];
    },
    staleTime: 60_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: ["video-library"] });
    qc.invalidateQueries({ queryKey: ["video-slot"] });
  };

  const create = useMutation({
    mutationFn: async (input: { label: string; page_path: string; position: PlacementPosition }) => {
      const { data: auth } = await supabase.auth.getUser();
      const slot_key = `custom_${crypto.randomUUID().slice(0, 8)}`;
      const { error } = await supabase
        .from("video_placements")
        .insert({ ...input, slot_key, created_by: auth.user?.id ?? null });
      if (error) throw error;
      return slot_key;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async (input: { id: string; label?: string; position?: PlacementPosition }) => {
      const { id, ...patch } = input;
      const { error } = await supabase.from("video_placements").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (p: VideoPlacement) => {
      await supabase.from("video_library").update({ slot_key: null }).eq("slot_key", p.slot_key);
      const { error } = await supabase.from("video_placements").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { placements: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}

/** Built-in slots plus custom placements, ready for grouped selects. */
export function useAllVideoSlots(): VideoSlotDef[] {
  const { placements } = useVideoPlacements();
  return [
    ...VIDEO_SLOTS,
    ...placements.map((p) => ({
      key: p.slot_key,
      label: p.label,
      hint: `Seite ${p.page_path}, ${p.position === "top" ? "oben" : "unten vor der Fusszeile"}`,
      group: "custom" as const,
    })),
  ];
}
