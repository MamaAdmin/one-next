import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import type { WhiteboardScene } from "./types";

async function invokeFn<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    const detail = (data as { error?: string } | null)?.error;
    if (detail) throw new Error(detail);
    if (error instanceof FunctionsHttpError) {
      const responseBody = await error.context.json().catch(() => null) as { error?: string } | null;
      throw new Error(responseBody?.error ?? error.message);
    }
    throw new Error(error.message);
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
  imageDirection?: string;
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

export const analyzeStyleReference = (styleRefPath: string) =>
  invokeFn<{ imageDirection: string }>("whiteboard-script", {
    action: "analyze_style_reference",
    styleRefPath,
  }).then((result) => result.imageDirection);

export const previewVoice = (voice: string, model?: string) =>
  invoke<{ url: string }>({ action: "voice_preview", voice, model }).then((r) => r.url);

export interface ImageOptions {
  model?: string;
  /** Gleicher Wert über alle Abschnitte hält den Look zusammen. */
  seed?: number | null;
  negativePrompt?: string | null;
  /** Erstes Bild der Serie als Stilreferenz. */
  styleRefUrl?: string | null;
  /** Ergänzende, für das gesamte Video geltende Bildvorgabe. */
  imageDirection?: string | null;
}

export const generateImage = (
  prompt: string,
  style = "strichzeichnung",
  options: ImageOptions | string = {},
) => {
  const opts = typeof options === "string" ? { model: options } : options;
  return invoke<{ url: string; taskId?: string }>({ action: "image", prompt, style, ...opts });
};

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const generateVoice = async (text: string, voice: string, model?: string) => {
  const { taskId } = await invoke<{ taskId: string }>({ action: "voice_start", text, voice, model });
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await wait(3000);
    const result = await invoke<{
      status: "pending" | "done" | "failed";
      url?: string;
      error?: string;
    }>({ action: "voice_status", taskId });
    if (result.status === "done" && result.url) return { url: result.url, taskId };
    if (result.status === "failed") {
      throw new Error(result.error ?? "Spracherzeugung fehlgeschlagen");
    }
  }
  throw new Error("Die Spracherzeugung dauert länger als erwartet. Bitte später erneut versuchen.");
};

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
