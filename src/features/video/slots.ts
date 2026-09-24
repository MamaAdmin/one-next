/** Video library: slots, providers and embed helpers. */

export type VideoProvider = "youtube" | "vimeo" | "direct";

export interface VideoSlotDef {
  /** Stable key stored in video_library.slot_key */
  key: string;
  /** User-facing name of the place where the video is shown */
  label: string;
  /** Short hint where exactly it appears */
  hint: string;
}

/** All places in the app that can show a library video. */
export const VIDEO_SLOTS: VideoSlotDef[] = [
  {
    key: "framing_landing",
    label: "Problem-Framing-Workshop · Einstieg",
    hint: "Video unter dem Titel „Wenn Ihre Challenge noch unklar ist“ auf der öffentlichen Seite Problem-Framing-Workshop",
  },
  {
    key: "framing_intro",
    label: "Problem Framing · So arbeitest du mit dem Tool",
    hint: "Einführungsseite des Problem-Framing-Workshops",
  },
  {
    key: "sprint_intro",
    label: "Design Sprint · So arbeitest du mit dem Tool",
    hint: "Einführung im Design-Sprint-Arbeitsbereich",
  },
  {
    key: "framing_team",
    label: "Problem Framing · Team-Konstellation",
    hint: "Box „So arbeitest du mit dem Tool“ auf der Seite Team-Konstellation",
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    key: `framing_step_${i + 1}`,
    label: `Problem Framing · Schritt ${i + 1}`,
    hint: `Box „So arbeitest du mit dem Tool" in Schritt ${i + 1}`,
  })),
];

export const getVideoSlot = (key: string): VideoSlotDef | undefined =>
  VIDEO_SLOTS.find((s) => s.key === key);

/** Detects the provider from a raw URL. */
export function detectProvider(raw: string): VideoProvider {
  const url = raw.trim().toLowerCase();
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("vimeo.com")) return "vimeo";
  return "direct";
}

export const PROVIDER_LABEL: Record<VideoProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  direct: "Direkte Datei",
};

/** Turns YouTube/Vimeo URLs into embed URLs. Invalid → null. */
export function toEmbedUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      const embedMatch = u.pathname.match(/^\/embed\/([\w-]+)/);
      if (embedMatch) return `https://www.youtube-nocookie.com/embed/${embedMatch[1]}`;
      return null;
    }
    if (u.hostname === "youtu.be" || u.hostname === "www.youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      return null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}?dnt=1`;
      return null;
    }
    return null;
  } catch {
    return null;
  }
}

/** True when the URL points directly at a playable video file. */
export function isDirectVideoUrl(raw: string): boolean {
  const url = raw.trim();
  if (!url) return false;
  try {
    const u = new URL(url);
    return /\.(mp4|webm|ogg|mov)$/i.test(u.pathname);
  } catch {
    return false;
  }
}

/** True when a URL can be played at all (embeddable or direct file). */
export const isPlayableVideoUrl = (raw: string): boolean =>
  Boolean(toEmbedUrl(raw)) || isDirectVideoUrl(raw);
