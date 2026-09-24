import { supabase } from "@/integrations/supabase/client";

export const LV_BUCKET = "lernvideo-assets";
export const POLL_MS = 15_000;
export const VOICES = ["Rachel", "Aria", "Bella", "Emma", "Hope", "Liam", "Brian", "Felix"];

export type Character = { name: string; description: string };
export type Pronunciation = { from: string; to: string };

export interface LvProject {
  id: string;
  title: string;
  style: string;
  format: "16:9" | "9:16";
  language: string;
  cost_limit_credits: number;
  status: string;
  topic: string;
  audience: string;
  learning_goal: string;
  target_seconds: number;
  voice: string;
  reference_paths: string[];
  characters: Character[];
  pronunciation: Pronunciation[];
  portrait_path: string | null;
}

export interface LvScene {
  id: string;
  project_id: string;
  position: number;
  narration: string;
  image_prompt: string;
  overlay_texts: string[];
  duration_seconds: number;
  audio_seconds: number | null;
}

export type AssetType = "audio" | "image" | "video" | "avatar";
export interface LvAsset {
  id: string;
  scene_id: string | null;
  type: AssetType;
  status: "queued" | "running" | "done" | "failed";
  model: string | null;
  storage_path: string | null;
  error_message: string | null;
  cost_credits: number | null;
  input_params: Record<string, unknown>;
  created_at: string;
}

export interface LvConfig {
  style: string;
  step: string;
  model_id: string | null;
  api: string;
  est_credits: number;
  active: boolean;
}

// Tabellen sind in den generierten Typen enthalten, die JSON-Spalten brauchen aber eigene Formen.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

export async function invokeKie(body: Record<string, unknown>): Promise<LvAsset> {
  const { data, error } = await supabase.functions.invoke("kie-create-task", { body });
  if (error) throw error;
  return data.asset as LvAsset;
}

/** Fragt den Status alle 15 Sekunden ab (Rückfallebene, falls der Callback ausbleibt). */
export async function waitForAsset(
  asset: LvAsset,
  onUpdate: (a: LvAsset) => void,
  signal?: { cancelled: boolean },
): Promise<LvAsset> {
  let current = asset;
  onUpdate(current);
  while (current.status === "queued" || current.status === "running") {
    await new Promise((r) => setTimeout(r, POLL_MS));
    if (signal?.cancelled) throw new Error("Abgebrochen");
    try {
      current = await invokeKie({ action: "status", assetId: current.id });
      onUpdate(current);
    } catch {
      /* nächster Versuch */
    }
  }
  return current;
}

export async function signedUrl(path: string, seconds = 60 * 60 * 24): Promise<string> {
  const { data, error } = await supabase.storage.from(LV_BUCKET).createSignedUrl(path, seconds);
  if (error || !data) throw new Error(error?.message ?? "Datei nicht verfügbar");
  return data.signedUrl;
}

export async function uploadProjectFile(projectId: string, file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `projects/${projectId}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(LV_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Ersetzt Wörter nur für die Sprachausgabe; der angezeigte Text bleibt unverändert. */
export function applyPronunciation(text: string, dict: Pronunciation[]): string {
  return dict
    .filter((d) => d.from.trim() && d.to.trim())
    .sort((a, b) => b.from.length - a.from.length)
    .reduce(
      (acc, d) => acc.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(d.from.trim())}(?![\\p{L}\\p{N}])`, "gu"), d.to.trim()),
      text,
    );
}

/** Bildprompt + feste Figurenbeschreibungen (nur für vorkommende Figuren) + Stil-Prompt. */
export function buildImagePrompt(scene: LvScene, project: LvProject, styleSuffix: string): string {
  const haystack = `${scene.image_prompt} ${scene.narration}`.toLowerCase();
  const chars = project.characters
    .filter((c) => c.name.trim() && haystack.includes(c.name.trim().toLowerCase()))
    .map((c) => `${c.name.trim()}: ${c.description.trim()}`);
  return [
    scene.image_prompt.trim(),
    chars.length ? `Characters (keep exactly consistent): ${chars.join("; ")}` : "",
    styleSuffix,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function audioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = () => resolve(a.duration);
    a.onerror = () => reject(new Error("Audiolänge nicht lesbar"));
    a.src = url;
  });
}

export function latestAsset(assets: LvAsset[], sceneId: string, type: AssetType): LvAsset | undefined {
  return assets
    .filter((a) => a.scene_id === sceneId && a.type === type)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}

export function stepsForStyle(configs: LvConfig[], style: string) {
  const find = (step: string) =>
    configs.find((c) => c.style === style && c.step === step && c.active && c.model_id && c.api !== "code" && c.api !== "upload");
  return {
    audio: find("audio"),
    image: find("image"),
    video: find("video"),
    avatar: find("avatar"),
    avatarFallback: find("avatar_fallback"),
  };
}

export function estimateSceneCredits(configs: LvConfig[], style: string): number {
  const s = stepsForStyle(configs, style);
  const main = s.avatar ? s.avatar.est_credits : s.video?.est_credits ?? 0;
  return (s.audio?.est_credits ?? 0) + (s.image?.est_credits ?? 0) + main;
}
