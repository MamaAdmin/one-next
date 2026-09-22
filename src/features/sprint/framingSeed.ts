// Bildet Ergebnisse aus dem Problem Framing auf die Sprint-Schritte 1.1–1.5 ab.
import type { FramingStepData } from "@/features/framing/types";

export interface FramingSeedItem {
  text: string;
  /** Framing-Schritt, aus dem der Eintrag stammt ("1".."10") */
  framingStepKey: string;
}

export interface FramingStepLite {
  step_key: string;
  data: FramingStepData;
}

/** Herkunftsmarkierung je Eintragstext im Sprint-Schritt. */
export interface HerkunftEntry {
  quelle: "framing";
  stepKey: string;
}

function push(out: FramingSeedItem[], stepKey: string, value: unknown) {
  if (typeof value === "string") {
    const v = value.trim();
    if (v) out.push({ text: v, framingStepKey: stepKey });
    return;
  }
  if (Array.isArray(value)) {
    for (const raw of value) {
      if (typeof raw === "string") push(out, stepKey, raw);
      else if (raw && typeof raw === "object" && "text" in raw) {
        push(out, stepKey, (raw as { text?: unknown }).text);
      }
    }
  }
}

function dedupe(items: FramingSeedItem[]): FramingSeedItem[] {
  const seen = new Set<string>();
  const out: FramingSeedItem[] = [];
  for (const it of items) {
    const k = it.text.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push({ ...it, text: it.text.trim() });
  }
  return out;
}

/**
 * Liefert die Einträge, mit denen ein Sprint-Schritt aus dem Framing
 * vorbefüllt werden kann. Leeres Array = keine Entsprechung.
 */
export function buildFramingSeed(
  sprintStepKey: string,
  framingSteps: FramingStepLite[],
): FramingSeedItem[] {
  const by = new Map(framingSteps.map((s) => [s.step_key, s.data ?? {}]));
  const d = (k: string): FramingStepData => (by.get(k) ?? {}) as FramingStepData;
  const out: FramingSeedItem[] = [];

  switch (sprintStepKey) {
    case "1.1": {
      push(out, "1", d("1").langfristziel);
      push(out, "4", d("4").sailboat?.hafen);
      break;
    }
    case "1.2": {
      const s9 = d("9");
      push(out, "9", s9.erfolgsmessung);
      push(out, "7", d("7").erfolgsmessung);
      break;
    }
    case "1.3": {
      push(out, "6", d("6").annahmen);
      push(out, "4", d("4").sailboat?.eisberg);
      break;
    }
    case "1.4": {
      push(out, "9", d("9").top1Challenge);
      push(out, "8", d("8").sprintFragen);
      push(out, "8", d("8").kiSprintFragen);
      break;
    }
    case "1.5": {
      push(out, "3", d("3").primaereZielgruppe);
      push(out, "3", d("3").stakeholder);
      push(out, "3", d("3").kiStakeholder);
      break;
    }
    default:
      return [];
  }

  return dedupe(out);
}

export const FRAMING_SEEDED_STEPS = ["1.1", "1.2", "1.3", "1.4", "1.5"];
