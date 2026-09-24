// Timeline-Beschreibung (JSON) für Vorschau und Export.
// Dieselben Layout-Regeln gelten im Browser und beim Creatomate-Render.

export type OverlayType = "title" | "term" | "number" | "list" | "bar" | "pie" | "subtitle";
export type OverlayPosition = "top" | "center" | "bottom" | "left" | "right";

export interface Overlay {
  id: string;
  type: OverlayType;
  text: string;
  detail?: string;
  value?: number;
  suffix?: string;
  items?: string[];
  data?: Array<{ label: string; value: number }>;
  position: OverlayPosition;
  /** Sekunden ab Szenenbeginn */
  start: number;
  duration: number;
}

export type VisualKind = "video" | "image" | "fallback" | "whiteboard" | "kinetic" | "none";

export interface TimelineScene {
  id: string;
  index: number;
  start: number;
  duration: number;
  visual: { kind: VisualKind; videoUrl?: string; imageUrl?: string; clipSeconds?: number };
  audio?: { url: string; duration: number };
  narration: string;
  overlays: Overlay[];
}

export interface Timeline {
  version: 1;
  title: string;
  format: "16:9" | "9:16";
  width: number;
  height: number;
  duration: number;
  music?: { url: string; volume: number; duckFactor: number };
  scenes: TimelineScene[];
  subtitles: Array<{ start: number; end: number; text: string }>;
}

export const OVERLAY_LABELS: Record<OverlayType, string> = {
  title: "Titel",
  term: "Begriff mit Erklärung",
  number: "Zahl mit Hochzählen",
  list: "Aufzählung",
  bar: "Balkendiagramm",
  pie: "Kreisdiagramm",
  subtitle: "Untertitel",
};

export const POSITION_LABELS: Record<OverlayPosition, string> = {
  top: "Oben", center: "Mitte", bottom: "Unten", left: "Links", right: "Rechts",
};

/** Spiegel der one-next-Tokens für den Export (Creatomate braucht Hex-Werte). */
export const EXPORT_COLORS = {
  cream: "#F3EFE9",
  slate: "#2F4254",
  accent: "#5A7A9A",
  tint: "#E3EBF3",
  charcoal: "#29231F",
};
export const EXPORT_FONT = "Inter";

export interface Box { x: number; y: number; w: number; h: number } // in % der Fläche, x/y = linke obere Ecke

/**
 * Hochformat ordnet neu an statt zu skalieren: Seitenspalten werden zu breiten Bändern
 * oben bzw. unten, Diagramme bekommen die volle Breite.
 */
export function overlayBox(type: OverlayType, position: OverlayPosition, format: "16:9" | "9:16"): Box {
  if (type === "subtitle") return format === "16:9" ? { x: 10, y: 84, w: 80, h: 10 } : { x: 6, y: 76, w: 88, h: 10 };
  const chart = type === "bar" || type === "pie";
  if (format === "16:9") {
    switch (position) {
      case "top": return { x: 10, y: 6, w: 80, h: chart ? 34 : 20 };
      case "bottom": return { x: 10, y: chart ? 52 : 64, w: 80, h: chart ? 30 : 18 };
      case "left": return { x: 5, y: 18, w: 38, h: 60 };
      case "right": return { x: 57, y: 18, w: 38, h: 60 };
      default: return { x: 15, y: chart ? 20 : 35, w: 70, h: chart ? 56 : 30 };
    }
  }
  switch (position) {
    case "top":
    case "left": return { x: 6, y: 8, w: 88, h: chart ? 30 : 20 };
    case "bottom":
    case "right": return { x: 6, y: chart ? 42 : 52, w: 88, h: chart ? 30 : 20 };
    default: return { x: 6, y: chart ? 30 : 36, w: 88, h: chart ? 34 : 26 };
  }
}

export function newOverlayId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Aus den Overlay-Texten des Skripts werden Titel-Overlays, falls noch keine gestaltet sind. */
export function defaultOverlays(texts: string[], duration: number): Overlay[] {
  const clean = texts.filter((t) => t.trim());
  const slot = Math.max(1.5, duration / Math.max(1, clean.length));
  return clean.map((t, i) => ({
    id: newOverlayId(),
    type: i === 0 ? "title" : "term",
    text: t.trim(),
    position: i === 0 ? "top" : "bottom",
    start: Math.round(i * slot * 10) / 10,
    duration: Math.min(slot, 4),
  }));
}

/** Untertitel: Sätze proportional zur Zeichenzahl über die Sprechzeit verteilt. */
export function subtitleCues(narration: string, start: number, speakSeconds: number) {
  const parts = narration
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?;:])\s+|(?<=,)\s+(?=\S{12,})/)
    .flatMap((s) => chunk(s.trim(), 84))
    .filter(Boolean);
  const total = parts.reduce((a, p) => a + p.length, 0) || 1;
  let t = start;
  return parts.map((p) => {
    const d = (p.length / total) * speakSeconds;
    const cue = { start: t, end: t + d, text: p };
    t += d;
    return cue;
  });
}

function chunk(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const words = text.split(" ");
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max && line) {
      out.push(line);
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) out.push(line);
  return out;
}

const pad = (n: number, l = 2) => String(Math.floor(n)).padStart(l, "0");
const srtTime = (s: number) => `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)},${pad((s % 1) * 1000, 3)}`;

/** SRT mit UTF-8-BOM, damit Umlaute auch in älteren Playern korrekt erscheinen. */
export function toSrt(cues: Timeline["subtitles"]): string {
  return "\uFEFF" + cues.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join("\n");
}
