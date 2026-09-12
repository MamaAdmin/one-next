import { FPS } from "./types";

/**
 * Gemeinsames Bewegungssystem: Jede Einstellung bekommt eine ruhige Kamerafahrt,
 * damit nie ein Standbild stehen bleibt. Die Variante hängt vom Abschnitt ab,
 * bleibt also über alle Renderdurchläufe gleich.
 */
export interface KenBurns {
  scaleFrom: number;
  scaleTo: number;
  xFrom: number;
  xTo: number;
  yFrom: number;
  yTo: number;
}

const MOVES: KenBurns[] = [
  { scaleFrom: 1.02, scaleTo: 1.12, xFrom: 0, xTo: -22, yFrom: 0, yTo: -12 },
  { scaleFrom: 1.12, scaleTo: 1.02, xFrom: 18, xTo: 0, yFrom: 10, yTo: 0 },
  { scaleFrom: 1.05, scaleTo: 1.14, xFrom: -20, xTo: 16, yFrom: 0, yTo: 0 },
  { scaleFrom: 1.1, scaleTo: 1.02, xFrom: 0, xTo: 0, yFrom: -18, yTo: 14 },
];

export const kenBurnsFor = (index: number): KenBurns => MOVES[Math.abs(index) % MOVES.length];

export interface TimedWord {
  text: string;
  fromFrame: number;
  toFrame: number;
}

/**
 * Verteilt den Sprechtext gleichmässig über die Abschnittsdauer.
 * Längere Wörter bekommen mehr Zeit, damit die Untertitel mitlaufen.
 */
export const timeWords = (narration: string, durationInSeconds: number): TimedWord[] => {
  const words = narration.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const weights = words.map((w) => Math.max(2, w.length));
  const total = weights.reduce((a, b) => a + b, 0);
  const frames = Math.max(FPS, Math.round(durationInSeconds * FPS));
  let cursor = 0;
  return words.map((text, i) => {
    const span = (weights[i] / total) * frames;
    const fromFrame = Math.round(cursor);
    cursor += span;
    return { text, fromFrame, toFrame: Math.round(cursor) };
  });
};

/** Untertitel in Zeilen von höchstens sieben Wörtern gruppieren. */
export const groupLines = (words: TimedWord[], perLine = 7): TimedWord[][] => {
  const lines: TimedWord[][] = [];
  for (let i = 0; i < words.length; i += perLine) lines.push(words.slice(i, i + perLine));
  return lines;
};
