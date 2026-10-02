import { supabase } from "@/integrations/supabase/client";

export interface LibraryImage {
  id: string;
  url: string;
  storage_path: string | null;
  prompt: string | null;
  source: string;
  video_id: string | null;
  video_title: string | null;
  scene_index: number | null;
  style: string | null;
  created_at: string;
}

export const listLibraryImages = async (): Promise<LibraryImage[]> => {
  const { data, error } = await supabase
    .from("image_library")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as LibraryImage[];
};

/** Stores a generated or uploaded image; duplicates are ignored. Never throws. */
export const addLibraryImage = async (input: Omit<LibraryImage, "id" | "created_at">): Promise<void> => {
  await supabase.from("image_library").upsert(input, { onConflict: "url", ignoreDuplicates: true });
};
