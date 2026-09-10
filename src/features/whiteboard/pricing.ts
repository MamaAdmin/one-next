import { supabase } from "@/integrations/supabase/client";
import type { WhiteboardScene } from "./types";

export type KieCategory = "text" | "image" | "voice" | "video" | "music";
export type KieUnit = "job" | "image" | "1k_chars" | "second";

export interface KieModel {
  id: string;
  name: string;
  display_name: string | null;
  provider: string | null;
  category: KieCategory;
  unit: KieUnit;
  credits_per_unit: number;
  active: boolean;
  recommended: boolean;
  description_de: string | null;
  strengths: string | null;
  use_cases: string[];
  quality_tier: string;
  speed_tier: string;
  input_modalities: string[];
  output_modalities: string[];
  docs_url: string | null;
  source: string;
  last_checked_at: string | null;
  updated_at: string;
}

export const SCRIPT_MODEL = "Lovable KI (Gemini)";
export const IMAGE_MODEL = "nano-banana-2";
export const VOICE_MODEL = "elevenlabs/text-to-speech-multilingual-v2";
export const VIDEO_MODEL = "veo3_fast";

export const UNIT_LABELS: Record<KieUnit, string> = {
  job: "pro Auftrag",
  image: "pro Bild",
  "1k_chars": "pro 1.000 Zeichen",
  second: "pro Sekunde",
};

export const CATEGORY_LABELS: Record<KieCategory, string> = {
  text: "Text",
  image: "Bild",
  voice: "Sprache",
  video: "Video",
  music: "Musik",
};

export const fetchKieModels = async (): Promise<KieModel[]> => {
  const { data, error } = await (supabase as any)
    .from("kie_models")
    .select("*")
    .order("category")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as KieModel[];
};

export const rateFor = (models: KieModel[], name: string): number => {
  const model = models.find((m) => m.name === name && m.active);
  return model ? Number(model.credits_per_unit) : 0;
};

const hasRate = (models: KieModel[], name: string): boolean =>
  models.some((m) => m.name === name && m.active);

export interface CostLine {
  label: string;
  model: string;
  units: number;
  unit: KieUnit;
  rate: number;
  credits: number;
  priceKnown: boolean;
}

export interface CostEstimate {
  lines: CostLine[];
  total: number;
  unknownModels: string[];
}

interface EstimateInput {
  models: KieModel[];
  sceneCount: number;
  scenes: WhiteboardScene[];
  includeScript: boolean;
  includeImages: boolean;
  includeVoices: boolean;
  videoSeconds?: number;
  scriptModel?: string;
  imageModel?: string;
  voiceModel?: string;
  videoModel?: string;
}

export const estimateCost = ({
  models,
  sceneCount,
  scenes,
  includeScript,
  includeImages,
  includeVoices,
  videoSeconds = 0,
  scriptModel = SCRIPT_MODEL,
  imageModel = IMAGE_MODEL,
  voiceModel = VOICE_MODEL,
  videoModel = VIDEO_MODEL,
}: EstimateInput): CostEstimate => {
  const lines: CostLine[] = [];
  const unknownModels: string[] = [];

  const track = (name: string) => {
    const known = hasRate(models, name);
    if (!known && !unknownModels.includes(name)) unknownModels.push(name);
    return known;
  };

  if (includeScript) {
    // Das Skript wird über die Lovable KI erzeugt und kostet keine Kie.ai-Credits.
    lines.push({
      label: "Skript",
      model: scriptModel,
      units: 1,
      unit: "job",
      rate: 0,
      credits: 0,
      priceKnown: true,
    });
  }

  if (includeImages) {
    // Abschnitte mit eigener Aufnahme brauchen keine KI-Zeichnung.
    const count = scenes.length
      ? scenes.filter((s) => s.mediaType !== "clip").length
      : sceneCount;
    const priceKnown = track(imageModel);
    const rate = rateFor(models, imageModel);
    lines.push({
      label: "Zeichnungen",
      model: imageModel,
      units: count,
      unit: "image",
      rate,
      credits: count * rate,
      priceKnown,
    });
  }

  if (includeVoices) {
    const chars = scenes.reduce((sum, s) => sum + (s.narration?.length ?? 0), 0);
    const priceKnown = track(voiceModel);
    const rate = rateFor(models, voiceModel);
    const units = Math.round((chars / 1000) * 100) / 100;
    lines.push({
      label: "Sprecherstimme",
      model: voiceModel,
      units,
      unit: "1k_chars",
      rate,
      credits: Math.round(units * rate * 100) / 100,
      priceKnown,
    });
  }

  if (videoSeconds > 0) {
    const priceKnown = track(videoModel);
    const rate = rateFor(models, videoModel);
    lines.push({
      label: "KI-Videoclip",
      model: videoModel,
      units: videoSeconds,
      unit: "second",
      rate,
      credits: videoSeconds * rate,
      priceKnown,
    });
  }

  const total = Math.round(lines.reduce((sum, l) => sum + l.credits, 0) * 100) / 100;
  return { lines, total, unknownModels };
};


export const formatCredits = (value: number | null | undefined): string =>
  value === null || value === undefined
    ? "–"
    : new Intl.NumberFormat("de-CH", { maximumFractionDigits: 2 }).format(Number(value));
