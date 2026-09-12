export interface SceneCaption {
  text: string;
  atSecond: number;
  durationInSeconds: number;
}

/** "image" = KI-Zeichnung, "ai_clip" = bewegter KI-Clip, "clip" = eigene Aufnahme. */
export type SceneMediaType = "image" | "ai_clip" | "clip";

export interface WhiteboardScene {
  id: string;
  heading: string;
  narration: string;
  bullets: string[];
  imagePrompt: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  durationInSeconds: number;
  mediaType?: SceneMediaType;
  /** Ein Satz, der die Bewegung im KI-Clip beschreibt. */
  motionPrompt?: string;
  /** Ergebnis der Bild-zu-Video-Generierung. */
  aiClipUrl?: string | null;
  aiClipTaskId?: string | null;
  aiClipSeconds?: number;
  /** Pfad im Bucket whiteboard-uploads; daraus wird die signierte Adresse geholt. */
  clipPath?: string | null;
  clipUrl?: string | null;
  clipStartInSeconds?: number;
  clipEndInSeconds?: number;
  captions?: SceneCaption[];
}

export const MAX_CAPTIONS = 3;

export const isClipScene = (scene: WhiteboardScene): boolean => scene.mediaType === "clip";

export const isAiClipScene = (scene: WhiteboardScene): boolean => scene.mediaType === "ai_clip";

/** Abschnitte, für die eine KI-Zeichnung erzeugt werden muss (auch KI-Clips brauchen ein Startbild). */
export const needsImage = (scene: WhiteboardScene): boolean => scene.mediaType !== "clip";

export type WhiteboardStatus = "draft" | "generating" | "ready" | "error";

export interface WhiteboardVideoProject {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  style: string;
  script_type: string;
  image_model: string | null;
  voice_model: string | null;
  video_model: string | null;
  voice: string;
  scenes: WhiteboardScene[];
  status: WhiteboardStatus;
  video_url: string | null;
  error_message: string | null;
  series_id: string | null;
  position: number | null;
  music_url: string | null;
  music_path?: string | null;
  music_volume: number | null;

  seed: number | null;
  style_ref_url: string | null;
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
  motionPrompt: "",
  imageUrl: null,
  audioUrl: null,
  durationInSeconds: 6,
});

export const totalDurationInFrames = (scenes: WhiteboardScene[]): number =>
  Math.max(
    FPS,
    scenes.reduce((sum, scene) => sum + Math.round((scene.durationInSeconds || 6) * FPS), 0),
  );
