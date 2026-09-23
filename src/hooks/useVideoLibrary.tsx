import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { detectProvider } from "@/features/video/slots";

export interface LibraryVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  provider: string;
  slot_key: string | null;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = ["video-library"];

/** All videos in the library, newest first. */
export function useVideoLibrary() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<LibraryVideo[]> => {
      const { data, error } = await supabase
        .from("video_library")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LibraryVideo[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["video-slot"] });
  };

  const createVideo = useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      video_url: string;
      slot_key?: string | null;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (input.slot_key) await clearSlot(input.slot_key);
      const { error } = await supabase.from("video_library").insert({
        title: input.title,
        description: input.description || null,
        video_url: input.video_url,
        provider: detectProvider(input.video_url),
        slot_key: input.slot_key || null,
        created_by: auth.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateVideo = useMutation({
    mutationFn: async (input: {
      id: string;
      title?: string;
      description?: string | null;
      video_url?: string;
    }) => {
      const patch: Record<string, unknown> = {};
      if (input.title !== undefined) patch.title = input.title;
      if (input.description !== undefined) patch.description = input.description || null;
      if (input.video_url !== undefined) {
        patch.video_url = input.video_url;
        patch.provider = detectProvider(input.video_url);
      }
      const { error } = await supabase.from("video_library").update(patch).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("video_library").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  /** Assigns a video to a slot; pass videoId null to leave the slot empty. */
  const assignSlot = useMutation({
    mutationFn: async (input: { slotKey: string; videoId: string | null }) => {
      await clearSlot(input.slotKey);
      if (input.videoId) {
        const { error } = await supabase
          .from("video_library")
          .update({ slot_key: input.slotKey })
          .eq("id", input.videoId);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  return {
    videos: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createVideo,
    updateVideo,
    deleteVideo,
    assignSlot,
  };
}

async function clearSlot(slotKey: string) {
  const { error } = await supabase
    .from("video_library")
    .update({ slot_key: null })
    .eq("slot_key", slotKey);
  if (error) throw error;
}

/** The video currently assigned to a slot (or null). */
export function useVideoSlot(slotKey: string) {
  return useQuery({
    queryKey: ["video-slot", slotKey],
    queryFn: async (): Promise<LibraryVideo | null> => {
      const { data, error } = await supabase
        .from("video_library")
        .select("*")
        .eq("slot_key", slotKey)
        .maybeSingle();
      if (error) throw error;
      return (data as LibraryVideo | null) ?? null;
    },
    staleTime: 60_000,
  });
}
