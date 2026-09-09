import { supabase } from "@/integrations/supabase/client";
import type { CostEstimate } from "./pricing";

export interface GenerationUsage {
  id: string;
  video_id: string | null;
  user_id: string;
  created_at: string;
  status: string;
  script_model: string | null;
  image_model: string | null;
  voice_model: string | null;
  video_model: string | null;
  number_of_sections: number;
  number_of_images: number;
  audio_characters: number;
  video_seconds: number;
  credits_before: number | null;
  credits_after: number | null;
  estimated_credits: number;
  credits_used: number | null;
  error_message: string | null;
}

export interface GenerationJob {
  id: string;
  usage_id: string | null;
  kind: string;
  task_id: string | null;
  model: string | null;
  units: number;
  estimated_credits: number;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface StartUsageInput {
  videoId: string;
  creditsBefore: number | null;
  estimate: CostEstimate;
  sections: number;
  images: number;
  audioCharacters: number;
  videoSeconds: number;
  models: {
    script?: string | null;
    image?: string | null;
    voice?: string | null;
    video?: string | null;
  };
}

export const startUsage = async (input: StartUsageInput): Promise<string | null> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await (supabase as any)
    .from("generation_usage")
    .insert({
      video_id: input.videoId,
      user_id: auth.user.id,
      status: "running",
      script_model: input.models.script ?? null,
      image_model: input.models.image ?? null,
      voice_model: input.models.voice ?? null,
      video_model: input.models.video ?? null,
      number_of_sections: input.sections,
      number_of_images: input.images,
      audio_characters: input.audioCharacters,
      video_seconds: input.videoSeconds,
      credits_before: input.creditsBefore,
      estimated_credits: input.estimate.total,
    })
    .select("id")
    .maybeSingle();
  if (error) return null;
  return (data as { id: string } | null)?.id ?? null;
};

export const logJob = async (params: {
  usageId: string | null;
  videoId: string;
  kind: "script" | "image" | "voice" | "video";
  model: string;
  units: number;
  estimatedCredits: number;
  status: "done" | "failed";
  taskId?: string | null;
  errorMessage?: string | null;
}) => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await (supabase as any).from("generation_jobs").insert({
    usage_id: params.usageId,
    video_id: params.videoId,
    user_id: auth.user.id,
    kind: params.kind,
    model: params.model,
    task_id: params.taskId ?? null,
    units: params.units,
    estimated_credits: params.estimatedCredits,
    status: params.status,
    error_message: params.errorMessage ?? null,
  });
};

export const finishUsage = async (params: {
  usageId: string | null;
  creditsAfter: number | null;
  actualCredits: number;
  status: "done" | "partial" | "failed";
  errorMessage?: string | null;
}) => {
  if (!params.usageId) return;
  await (supabase as any)
    .from("generation_usage")
    .update({
      credits_after: params.creditsAfter,
      credits_used: Math.max(0, Math.round(params.actualCredits * 100) / 100),
      status: params.status,
      error_message: params.errorMessage ?? null,
    })
    .eq("id", params.usageId);
};
