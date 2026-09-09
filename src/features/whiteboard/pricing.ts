import { supabase } from "@/integrations/supabase/client";
import type { WhiteboardScene } from "./types";

export type KieCategory = "text" | "image" | "voice" | "video";
export type KieUnit = "job" | "image" | "1k_chars" | "second";

export interface KieModel {
  id: string;
  name: string;
  category: KieCategory;
  unit: KieUnit;
  credits_per_unit: number;
  active: boolean;
  updated_at: string;
}

export const SCRIPT_MODEL = "gpt-5-2";
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

export interface CostLine {
  label: string;
  model: string;
  units: number;
  unit: KieUnit;
  rate: number;
  credits: number;
}

export interface CostEstimate {
  lines: CostLine[];
  total: number;
}

interface EstimateInput {
  models: KieModel[];
  sceneCount: number;
  scenes: WhiteboardScene[];
  includeScript: boolean;
  includeImages: boolean;
  includeVoices: boolean;
  videoSeconds?: number;
}

export const estimateCost = ({
  models,
  sceneCount,
  scenes,
  includeScript,
  includeImages,
  includeVoices,
  videoSeconds = 0,
}: EstimateInput): CostEstimate => {
  const lines: CostLine[] = [];

  if (includeScript) {
    const rate = rateFor(models, SCRIPT_MODEL);
    lines.push({
      label: "Skript",
      model: SCRIPT_MODEL,
      units: 1,
      unit: "job",
      rate,
      credits: rate,
    });
  }

  if (includeImages) {
    const count = scenes.length || sceneCount;
    const rate = rateFor(models, IMAGE_MODEL);
    lines.push({
      label: "Zeichnungen",
      model: IMAGE_MODEL,
      units: count,
      unit: "image",
      rate,
      credits: count * rate,
    });
  }

  if (includeVoices) {
    const chars = scenes.reduce((sum, s) => sum + (s.narration?.length ?? 0), 0);
    const rate = rateFor(models, VOICE_MODEL);
    const units = Math.round((chars / 1000) * 100) / 100;
    lines.push({
      label: "Sprecherstimme",
      model: VOICE_MODEL,
      units,
      unit: "1k_chars",
      rate,
      credits: Math.round(units * rate * 100) / 100,
    });
  }

  if (videoSeconds > 0) {
    const rate = rateFor(models, VIDEO_MODEL);
    lines.push({
      label: "KI-Videoclip",
      model: VIDEO_MODEL,
      units: videoSeconds,
      unit: "second",
      rate,
      credits: videoSeconds * rate,
    });
  }

  const total = Math.round(lines.reduce((sum, l) => sum + l.credits, 0) * 100) / 100;
  return { lines, total };
};

export const formatCredits = (value: number | null | undefined): string =>
  value === null || value === undefined
    ? "–"
    : new Intl.NumberFormat("de-CH", { maximumFractionDigits: 2 }).format(Number(value));
