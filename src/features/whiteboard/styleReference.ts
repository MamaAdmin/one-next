import { supabase } from "@/integrations/supabase/client";

export const STYLE_REFERENCE_BUCKET = "whiteboard-uploads";
export const MAX_STYLE_REFERENCE_BYTES = 10 * 1024 * 1024;
const SIGNED_SECONDS = 60 * 60 * 6;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const validateStyleReference = (file: File): string | null => {
  if (!ALLOWED_TYPES[file.type]) return "Nur JPG-, PNG- oder WebP-Bilder sind möglich.";
  if (file.size > MAX_STYLE_REFERENCE_BYTES) return "Das Referenzbild darf höchstens 10 MB gross sein.";
  return null;
};

export const signedStyleReferenceUrl = async (path: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from(STYLE_REFERENCE_BUCKET)
    .createSignedUrl(path, SIGNED_SECONDS);
  if (error) return null;
  return data?.signedUrl ?? null;
};

export const uploadStyleReference = async (
  videoId: string,
  file: File,
): Promise<{ path: string; url: string }> => {
  const extension = ALLOWED_TYPES[file.type] ?? "jpg";
  const path = `style-references/${videoId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from(STYLE_REFERENCE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  const url = await signedStyleReferenceUrl(path);
  if (!url) throw new Error("Das Referenzbild wurde gespeichert, konnte aber nicht geladen werden.");
  return { path, url };
};

export const deleteStyleReference = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from(STYLE_REFERENCE_BUCKET).remove([path]);
  if (error) throw new Error(error.message);
};