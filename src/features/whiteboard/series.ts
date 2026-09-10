import { supabase } from "@/integrations/supabase/client";
import type { WhiteboardVideoProject } from "./types";

export interface WhiteboardVideoSeries {
  id: string;
  user_id: string;
  title: string;
  description: string;
  style: string;
  script_type: string;
  voice: string;
  image_model: string;
  voice_model: string;
  video_model: string;
  created_at: string;
  updated_at: string;
}

export const fetchSeriesList = async (): Promise<WhiteboardVideoSeries[]> => {
  const { data, error } = await (supabase as any)
    .from("whiteboard_video_series")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as WhiteboardVideoSeries[];
};

export const fetchSeries = async (id: string): Promise<WhiteboardVideoSeries | null> => {
  const { data, error } = await (supabase as any)
    .from("whiteboard_video_series")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as WhiteboardVideoSeries | null) ?? null;
};

export const createSeries = async (
  defaults: Partial<WhiteboardVideoSeries>,
): Promise<WhiteboardVideoSeries> => {
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await (supabase as any)
    .from("whiteboard_video_series")
    .insert({ user_id: auth.user?.id, ...defaults })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as WhiteboardVideoSeries;
};

export const updateSeries = async (id: string, patch: Partial<WhiteboardVideoSeries>) => {
  const { error } = await (supabase as any)
    .from("whiteboard_video_series")
    .update(patch)
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteSeries = async (id: string) => {
  const { error } = await (supabase as any).from("whiteboard_video_series").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const fetchSeriesClips = async (seriesId: string): Promise<WhiteboardVideoProject[]> => {
  const { data, error } = await (supabase as any)
    .from("whiteboard_videos")
    .select("*")
    .eq("series_id", seriesId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as WhiteboardVideoProject[];
};

export const fetchSeriesClipSummary = async (): Promise<
  Record<string, { total: number; ready: number; draft: number; error: number }>
> => {
  const { data, error } = await (supabase as any)
    .from("whiteboard_videos")
    .select("series_id,status")
    .not("series_id", "is", null);
  if (error) throw new Error(error.message);
  const summary: Record<string, { total: number; ready: number; draft: number; error: number }> = {};
  for (const row of (data ?? []) as Array<{ series_id: string; status: string }>) {
    const entry = (summary[row.series_id] ??= { total: 0, ready: 0, draft: 0, error: 0 });
    entry.total += 1;
    if (row.status === "ready") entry.ready += 1;
    else if (row.status === "error") entry.error += 1;
    else entry.draft += 1;
  }
  return summary;
};

export const savePositions = async (clips: Array<{ id: string }>) => {
  await Promise.all(
    clips.map((clip, index) =>
      (supabase as any).from("whiteboard_videos").update({ position: index + 1 }).eq("id", clip.id),
    ),
  );
};

export const applySeriesSettingsToClips = async (
  seriesId: string,
  settings: Pick<
    WhiteboardVideoSeries,
    "style" | "script_type" | "voice" | "image_model" | "voice_model" | "video_model"
  >,
) => {
  const { error } = await (supabase as any)
    .from("whiteboard_videos")
    .update(settings)
    .eq("series_id", seriesId);
  if (error) throw new Error(error.message);
};

/* ---------- Markdown-Import ---------- */

export interface ParsedClip {
  title: string;
  topic: string;
}

const NOTE_SECTIONS: Array<{ key: string; label: string }> = [
  { key: "bildregie", label: "Bildregie" },
  { key: "beispiel-eingaben", label: "Beispiel-Eingaben" },
  { key: "beispieleingaben", label: "Beispiel-Eingaben" },
  { key: "merksatz", label: "Merksatz" },
];

const normalizeLabel = (line: string): string =>
  line
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-*]\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase();

export const parseSeriesMarkdown = (markdown: string): ParsedClip[] => {
  const blocks = markdown.split(/^##\s+/m).slice(1);
  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const title = lines[0].replace(/\*\*/g, "").trim();
      const body = lines.slice(1);

      let sprechtext: string[] = [];
      const notes: Record<string, string[]> = {};
      let current: string | null = null;

      for (const raw of body) {
        const line = raw.trim();
        const label = normalizeLabel(line);
        if (label === "sprechtext") {
          current = "sprechtext";
          continue;
        }
        const note = NOTE_SECTIONS.find((n) => n.key === label);
        if (note) {
          current = note.label;
          notes[note.label] ??= [];
          continue;
        }
        if (!line) {
          // Absatzende beendet den Sprechtext, sobald etwas erfasst wurde
          if (current === "sprechtext" && sprechtext.length > 0) current = null;
          continue;
        }
        if (current === "sprechtext") sprechtext.push(line);
        else if (current) notes[current].push(line.replace(/^[-*]\s*/, ""));
      }

      const parts: string[] = [];
      if (sprechtext.length) parts.push(sprechtext.join(" "));
      const seen = new Set<string>();
      for (const { label } of NOTE_SECTIONS) {
        if (seen.has(label)) continue;
        seen.add(label);
        const entries = notes[label];
        if (entries && entries.length) parts.push(`${label}: ${entries.join(" ")}`);
      }

      return { title, topic: parts.join("\n\n").trim() };
    })
    .filter((clip) => clip.title.length > 0);
};

export const createClipsFromParsed = async (
  series: WhiteboardVideoSeries,
  clips: ParsedClip[],
  startPosition: number,
) => {
  const { data: auth } = await supabase.auth.getUser();
  const rows = clips.map((clip, index) => ({
    user_id: auth.user?.id,
    series_id: series.id,
    position: startPosition + index,
    title: clip.title,
    topic: clip.topic,
    style: series.style,
    script_type: series.script_type,
    voice: series.voice,
    image_model: series.image_model,
    voice_model: series.voice_model,
    video_model: series.video_model,
  }));
  const { error } = await (supabase as any).from("whiteboard_videos").insert(rows);
  if (error) throw new Error(error.message);
};
