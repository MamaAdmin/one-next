import { supabase } from "@/integrations/supabase/client";

export const MUSIC_BUCKET = "whiteboard-uploads";
export const MAX_MUSIC_BYTES = 20 * 1024 * 1024;
const SIGNED_SECONDS = 60 * 60 * 6;

const ALLOWED_TYPES: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "m4a",
  "audio/ogg": "ogg",
};

/** Prüft Typ und Größe im Browser und liefert eine verständliche Meldung. */
export const validateMusicFile = (file: File): string | null => {
  if (!ALLOWED_TYPES[file.type]) {
    return "Nur MP3-, WAV-, M4A- oder OGG-Dateien sind möglich.";
  }
  if (file.size > MAX_MUSIC_BYTES) {
    const mb = Math.round(file.size / (1024 * 1024));
    return `Die Datei ist ${mb} MB gross. Erlaubt sind höchstens 20 MB.`;
  }
  return null;
};

export const signedMusicUrl = async (path: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from(MUSIC_BUCKET)
    .createSignedUrl(path, SIGNED_SECONDS);
  if (error) return null;
  return data?.signedUrl ?? null;
};

export const uploadMusic = async (
  videoId: string,
  file: File,
): Promise<{ path: string; url: string }> => {
  const extension = ALLOWED_TYPES[file.type] ?? "mp3";
  const path = `music/${videoId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from(MUSIC_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw new Error(error.message);
  const url = await signedMusicUrl(path);
  if (!url) throw new Error("Die Musik wurde gespeichert, konnte aber nicht geladen werden.");
  return { path, url };
};

export const removeMusic = async (path: string): Promise<void> => {
  await supabase.storage.from(MUSIC_BUCKET).remove([path]);
};
