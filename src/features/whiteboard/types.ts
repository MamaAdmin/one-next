export interface WhiteboardScene {
  id: string;
  heading: string;
  narration: string;
  bullets: string[];
  imagePrompt: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  durationInSeconds: number;
}

export type WhiteboardStatus = "draft" | "generating" | "ready" | "error";

export interface WhiteboardVideoProject {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  style: string;
  voice: string;
  scenes: WhiteboardScene[];
  status: WhiteboardStatus;
  video_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export const FPS = 30;

export const createEmptyScene = (index: number): WhiteboardScene => ({
  id: `scene-${Date.now()}-${index}`,
  heading: "Neuer Abschnitt",
  narration: "",
  bullets: [],
  imagePrompt: "",
  imageUrl: null,
  audioUrl: null,
  durationInSeconds: 6,
});

export const totalDurationInFrames = (scenes: WhiteboardScene[]): number =>
  Math.max(
    FPS,
    scenes.reduce((sum, scene) => sum + Math.round((scene.durationInSeconds || 6) * FPS), 0),
  );
