import { supabase } from "@/integrations/supabase/client";
import type { WhiteboardScene } from "./types";

async function invokeFn<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    const detail = (data as { error?: string } | null)?.error;
    throw new Error(detail ?? error.message);
  }
  if ((data as { error?: string })?.error) {
    throw new Error((data as { error: string }).error);
  }
  return data as T;
}

/** Bewegungsvorschläge für einen Abschnitt per Gemini generieren. */
export async function fetchMotionSuggestions(
  heading: string,
  bullets: string[],
  imagePrompt: string,
  styleLabel?: string,
): Promise<string[]> {
  const result = await invokeFn<{ suggestions: string[] }>("whiteboard-motion-suggest", {
    heading,
    bullets,
    imagePrompt,
    styleLabel,
  });
  return result.suggestions ?? [];
}

const invoke = <T,>(body: Record<string, unknown>) => invokeFn<T>("kie-whiteboard", body);

export interface GeneratedScript {
  title: string;
  scenes: Array<{
    heading: string;
    narration: string;
    bullets: string[];
    imagePrompt: string;
    durationInSeconds: number;
  }>;
}

export interface ScriptOptions {
  scriptType?: string;
  scriptHint?: string;
  styleLabel?: string;
  language?: string;
}

export const generateScript = (
  topic: string,
  sceneCount: number,
  title: string,
  options: ScriptOptions = {},
) =>
  invokeFn<{ script: GeneratedScript }>("whiteboard-script", {
    topic,
    sceneCount,
    title,
    ...options,
  }).then((r) => r.script);

export const previewVoice = (voice: string, model?: string) =>
  invoke<{ url: string }>({ action: "voice_preview", voice, model }).then((r) => r.url);

export interface ImageOptions {
  model?: string;
  /** Gleicher Wert über alle Abschnitte hält den Look zusammen. */
  seed?: number | null;
  negativePrompt?: string | null;
  /** Erstes Bild der Serie als Stilreferenz. */
  styleRefUrl?: string | null;
}

export const generateImage = (
  prompt: string,
  style = "strichzeichnung",
  options: ImageOptions | string = {},
) => {
  const opts = typeof options === "string" ? { model: options } : options;
  return invoke<{ url: string; taskId?: string }>({ action: "image", prompt, style, ...opts });
};

export const generateVoice = (text: string, voice: string, model?: string) =>
  invoke<{ url: string; taskId?: string }>({ action: "voice", text, voice, model });

export const fetchCredits = () =>
  invoke<{ credits: number }>({ action: "credits" }).then((r) => r.credits);

export interface VideoOptions {
  model?: string;
  /** Startbild für Bild-zu-Video; ohne Bild entsteht ein reiner Textclip. */
  imageUrl?: string | null;
  seconds?: number;
  seed?: number | null;
}

export const startVideo = (prompt: string, options: VideoOptions | string = {}) => {
  const opts = typeof options === "string" ? { model: options } : options;
  return invoke<{ taskId: string }>({ action: "video_start", prompt, ...opts }).then((r) => r.taskId);
};

export const checkVideo = (taskId: string) =>
  invoke<{ status: "pending" | "done" | "failed"; url?: string; error?: string }>({
    action: "video_status",
    taskId,
  });

export const estimateDuration = (scene: WhiteboardScene): number => {
  const words = scene.narration.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(4, Math.round((words / 2.4) * 10) / 10 + 1);
};
