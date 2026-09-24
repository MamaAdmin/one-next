import { supabase } from "@/integrations/supabase/client";
import type { WhiteboardScene } from "./types";

interface Cue {
  start: number;
  end: number;
  text: string;
}

const sceneSeconds = (s: WhiteboardScene) => Math.max(1, s.durationInSeconds || 6);

/** Sprechtext in kurze Untertitel-Stücke teilen, gleichmässig über die Dauer verteilt. */
export const subtitleCues = (scenes: WhiteboardScene[]): Cue[] => {
  const cues: Cue[] = [];
  let t = 0;
  for (const s of scenes) {
    const d = sceneSeconds(s);
    const words = (s.narration || "").split(/\s+/).filter(Boolean);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 8) chunks.push(words.slice(i, i + 8).join(" "));
    const total = Math.max(1, words.length);
    let pos = 0;
    chunks.forEach((c) => {
      const n = c.split(" ").length;
      cues.push({ start: t + (pos / total) * d, end: t + ((pos + n) / total) * d, text: c });
      pos += n;
    });
    t += d;
  }
  return cues;
};

const pad = (n: number, l = 2) => String(Math.floor(n)).padStart(l, "0");
const srtTime = (s: number) =>
  `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)},${pad((s % 1) * 1000, 3)}`;

export const toSrt = (cues: Cue[]) =>
  "\uFEFF" +
  cues.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join("\n");

const httpUrl = (u?: string | null) => (u && /^https?:\/\//.test(u) ? u : undefined);

export const buildTimeline = (opts: {
  title: string;
  scenes: WhiteboardScene[];
  style: string;
  musicUrl?: string | null;
  musicVolume: number;
}) => {
  let t = 0;
  const scenes = opts.scenes.map((s, index) => {
    const duration = sceneSeconds(s);
    const start = t;
    t += duration;
    const image = httpUrl(s.imageUrl);
    const clip = s.mediaType === "clip" ? httpUrl(s.clipUrl) : s.mediaType === "ai_clip" ? httpUrl(s.aiClipUrl) : undefined;
    const visual = clip
      ? { kind: "video" as const, videoUrl: clip, imageUrl: image, clipSeconds: s.aiClipSeconds }
      : image
        ? { kind: opts.style === "whiteboard" ? ("whiteboard" as const) : ("image" as const), imageUrl: image }
        : { kind: "none" as const };
    const audio = httpUrl(s.audioUrl);
    const overlays =
      index === 0 && opts.title
        ? [{ id: "title", type: "title", text: opts.title.slice(0, 500), position: "top", start: 0, duration: Math.min(3, duration) }]
        : [];
    return {
      id: s.id,
      index,
      start,
      duration,
      visual,
      audio: audio ? { url: audio, duration } : undefined,
      narration: (s.narration || "").slice(0, 5000),
      overlays,
    };
  });
  const music = httpUrl(opts.musicUrl);
  return {
    version: 1 as const,
    title: opts.title.slice(0, 300),
    format: "16:9" as const,
    width: 1920,
    height: 1080,
    duration: Math.max(1, t),
    music: music ? { url: music, volume: opts.musicVolume, duckFactor: 0.4 } : undefined,
    scenes,
    subtitles: subtitleCues(opts.scenes),
  };
};

const invoke = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("render-video", { body: { target: "whiteboard", ...body } });
  if (error) {
    let msg = error.message;
    try {
      const ctx = await (error as { context?: Response }).context?.json();
      if (ctx?.error) msg = typeof ctx.error === "string" ? ctx.error : "Ungültige Daten für den Export";
    } catch {
      /* ignorieren */
    }
    throw new Error(msg);
  }
  if (data?.error && typeof data.error === "string" && !data.status) throw new Error(data.error);
  return data as { status?: string; exportPath?: string; error?: string; renderId?: string };
};

export const startServerExport = (projectId: string, timeline: ReturnType<typeof buildTimeline>, subtitles: boolean) =>
  invoke({ action: "start", projectId, timeline, subtitles });

export const serverExportStatus = (projectId: string) => invoke({ action: "status", projectId });

export const signedExportUrl = async (path: string) => {
  const { data } = await supabase.storage.from("whiteboard-uploads").createSignedUrl(path, 3600, { download: true });
  return data?.signedUrl ?? null;
};
