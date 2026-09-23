import type { SprintStepDef } from "./steps";
import type { SprintStepData } from "./types";

/**
 * Weiche Qualitätsprüfung je Sprint-Schritt. Analog zum Problem Framing:
 * die Rückgabe blockiert nichts, sie wird beim Abschliessen als Hinweis angezeigt.
 */
export function getSprintStepWarnings(
  step: SprintStepDef,
  d: SprintStepData,
): string[] {
  const w: string[] = [];
  const antworten = (d.antworten ?? []).map((x) => x.trim()).filter(Boolean);
  const eigene = (d.eigene ?? []).map((x) => x.trim()).filter(Boolean);
  const auswahl = (d.auswahl ?? []).map((x) => x.trim()).filter(Boolean);
  const notes = (d.notes ?? "").trim();
  const eintraege = antworten.length + eigene.length;

  switch (step.variant) {
    case "notes":
      if (!notes) w.push("Noch keine Notizen erfasst.");
      return w;
    case "map": {
      const zugeordnet = Object.values(d.mapZuordnung ?? {}).filter(Boolean).length;
      if (zugeordnet === 0) w.push("Auf der Karte ist noch nichts zugeordnet.");
      if (eintraege === 0) w.push("Noch keine Einträge unter „Deine Antworten“.");
      return w;
    }
    case "prototype":
      if (eintraege === 0 && !notes)
        w.push("Zum Prototyp ist noch nichts festgehalten.");
      return w;
    case "ideas":
    case "crazy8s":
    case "sketches":
      if (eintraege === 0) w.push("Noch keine Ideen bzw. Skizzen festgehalten.");
      return w;
    case "storyboard":
      if (eintraege === 0) w.push("Das Storyboard ist noch leer.");
      return w;
    case "table":
      if (eintraege === 0) w.push("Noch keine Zeile erfasst.");
      break;
    case "form":
    case "flow-3-steps":
      if (eintraege === 0) w.push("Noch keine Angaben in diesem Schritt.");
      break;
    case "choice":
      if (eintraege === 0) w.push("Noch keine Optionen erfasst.");
      if (auswahl.length === 0) w.push("Keine Entscheidung festgehalten.");
      return w;
    case "scorecard":
    case "heatmap":
    case "hot-takes":
      if (eintraege === 0) w.push("Noch keine Einträge in diesem Schritt.");
      break;
    default:
      if (eintraege === 0) w.push("Noch keine Einträge unter „Deine Antworten“.");
      break;
  }

  if (typeof step.stimmenLimit === "number" && auswahl.length === 0 && eintraege > 0) {
    w.push("Keine Auswahl getroffen – damit bleibt offen, was weitergetragen wird.");
  }

  return w;
}
