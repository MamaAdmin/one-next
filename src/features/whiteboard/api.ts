import { supabase } from "@/integrations/supabase/client";
import type { WhiteboardScene } from "./types";

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("kie-whiteboard", { body });
  if (error) {
    const detail = (data as { error?: string } | null)?.error;
    throw new Error(detail ?? error.message);
  }
  if ((data as { error?: string })?.error) {
    throw new Error((data as { error: string }).error);
  }
  return data as T;
}

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

export const generateScript = (topic: string, sceneCount: number, title: string) =>
  invoke<{ script: GeneratedScript }>({ action: "script", topic, sceneCount, title }).then(
    (r) => r.script,
  );

export const generateImage = (prompt: string) =>
  invoke<{ url: string }>({ action: "image", prompt }).then((r) => r.url);

export const generateVoice = (text: string, voice: string) =>
  invoke<{ url: string }>({ action: "voice", text, voice }).then((r) => r.url);

export const startVideo = (prompt: string) =>
  invoke<{ taskId: string }>({ action: "video_start", prompt }).then((r) => r.taskId);

export const checkVideo = (taskId: string) =>
  invoke<{ status: "pending" | "done" | "failed"; url?: string; error?: string }>({
    action: "video_status",
    taskId,
  });

export const estimateDuration = (scene: WhiteboardScene): number => {
  const words = scene.narration.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(4, Math.round((words / 2.4) * 10) / 10 + 1);
};
