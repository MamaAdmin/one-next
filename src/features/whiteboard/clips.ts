import { supabase } from "@/integrations/supabase/client";
import type { WhiteboardScene } from "./types";

export const CLIP_BUCKET = "whiteboard-uploads";
export const MAX_CLIP_BYTES = 200 * 1024 * 1024;
const ALLOWED_TYPES = ["video/mp4", "video/webm"];
const SIGNED_SECONDS = 60 * 60 * 6;

/** Prüft Typ und Größe im Browser und liefert eine verständliche Meldung. */
export const validateClipFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Nur MP4- und WEBM-Aufnahmen sind möglich.";
  }
  if (file.size > MAX_CLIP_BYTES) {
    const mb = Math.round(file.size / (1024 * 1024));
    return `Die Datei ist ${mb} MB gross. Erlaubt sind höchstens 200 MB.`;
  }
  return null;
};

export const signedClipUrl = async (path: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from(CLIP_BUCKET)
    .createSignedUrl(path, SIGNED_SECONDS);
  if (error) return null;
  return data?.signedUrl ?? null;
};

export const uploadClip = async (
  videoId: string,
  sceneId: string,
  file: File,
): Promise<{ path: string; url: string }> => {
  const extension = file.type === "video/webm" ? "webm" : "mp4";
  const path = `video/${videoId}/${sceneId}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from(CLIP_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw new Error(error.message);
  const url = await signedClipUrl(path);
  if (!url) throw new Error("Die Aufnahme wurde gespeichert, konnte aber nicht geladen werden.");
  return { path, url };
};

/** Holt für alle Aufnahme-Abschnitte frische signierte Adressen. */
export const withFreshClipUrls = async (
  scenes: WhiteboardScene[],
): Promise<WhiteboardScene[]> => {
  const result = await Promise.all(
    scenes.map(async (scene) => {
      if (scene.mediaType !== "clip" || !scene.clipPath) return scene;
      const url = await signedClipUrl(scene.clipPath);
      return url ? { ...scene, clipUrl: url } : scene;
    }),
  );
  return result;
};

export const clipLengthInSeconds = (scene: WhiteboardScene): number | null => {
  const start = scene.clipStartInSeconds ?? 0;
  const end = scene.clipEndInSeconds;
  if (end === undefined || end === null) return null;
  const length = end - start;
  return length > 0 ? length : null;
};
