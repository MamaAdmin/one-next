import { supabase } from "@/integrations/supabase/client";
import { STYLE_REFERENCE_BUCKET } from "@/features/whiteboard/styleReference";

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
  const rows = (data ?? []) as LibraryImage[];
  // Uploaded files live in a private bucket: refresh their expiring links.
  const paths = rows.map((r) => r.storage_path).filter(Boolean) as string[];
  if (!paths.length) return rows;
  const { data: signed } = await supabase.storage
    .from(STYLE_REFERENCE_BUCKET)
    .createSignedUrls(paths, 60 * 60 * 6);
  const fresh = new Map((signed ?? []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl]));
  return rows.map((r) => (r.storage_path && fresh.get(r.storage_path) ? { ...r, url: fresh.get(r.storage_path)! } : r));
};

/** Stores a generated or uploaded image; duplicates are ignored. Never throws. */
export const addLibraryImage = async (input: Omit<LibraryImage, "id" | "created_at">): Promise<void> => {
  await supabase.from("image_library").upsert(input, { onConflict: "url", ignoreDuplicates: true });
};

const stripQuery = (u: string) => u.split("?")[0];

/** Returns the ids of library images referenced by any whiteboard video (scenes or style reference). */
export const listUsedLibraryImageIds = async (images: LibraryImage[]): Promise<Set<string>> => {
  const { data, error } = await supabase
    .from("whiteboard_videos")
    .select("scenes, style_ref_url, style_ref_path");
  if (error) throw error;
  const haystack = JSON.stringify(data ?? []);
  const used = new Set<string>();
  for (const img of images) {
    const keys = [img.storage_path, stripQuery(img.url)].filter(Boolean) as string[];
    if (keys.some((k) => haystack.includes(k))) used.add(img.id);
  }
  return used;
};

/** Deletes a library entry and, for uploads, the stored file. */
export const deleteLibraryImage = async (img: LibraryImage): Promise<void> => {
  const { error } = await supabase.from("image_library").delete().eq("id", img.id);
  if (error) throw error;
  if (img.storage_path) await supabase.storage.from(STYLE_REFERENCE_BUCKET).remove([img.storage_path]);
};
