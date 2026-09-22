import type { FramingStepData } from "./types";

/**
 * Weiche Qualitätsprüfung je Schritt. Die Rückgabe blockiert nichts –
 * sie wird beim Abschliessen als Hinweis angezeigt.
 */
export function getStepWarnings(stepKey: string, d: FramingStepData): string[] {
  const w: string[] = [];
  const leer = (s?: string) => !s || !s.trim();
  switch (stepKey) {
    case "1":
      if (leer(d.langfristziel)) w.push("Langfristziel fehlt – darauf bezieht sich der ganze Sprint.");
      if (leer(d.kontext)) w.push("Kontext ist leer.");
      if (!(d.nichtZiele?.length || d.kiNichtZiele?.length)) w.push("Kein Nicht-Ziel festgehalten.");
      break;
    case "2":
      if (leer(d.warumJetzt)) w.push("'Warum jetzt' fehlt.");
      if (!d.defaultFuture || (Array.isArray(d.defaultFuture) && d.defaultFuture.length === 0))
        w.push("Standard-Zukunft fehlt – ohne sie fehlt später der Leidensdruck im Statement.");
      break;
    case "3":
      if (leer(d.primaereZielgruppe)) w.push("Primäre Zielgruppe nicht festgelegt.");
      if (!(d.stakeholder?.length || d.kiStakeholder?.length)) w.push("Keine Stakeholder erfasst.");
      break;
    case "4":
      if (leer(d.sailboat?.hafen)) w.push("Hafen (Ziel) ist leer.");
      if (!d.sailboat?.anker?.length) w.push("Keine Anker – Schritt 5 startet dann ohne Anhaltspunkt.");
      break;
    case "5":
      if (leer(d.symptom)) w.push("Kein Startsymptom – die Warum-Kette hängt dann in der Luft.");
      if (((d.fiveWhys?.length ?? 0) + (d.kiFiveWhys?.length ?? 0)) < 3)
        w.push("Weniger als drei Warum-Ebenen.");
      if (!d.ursachen?.some((u) => u.adressierbar)) w.push("Keine adressierbare Ursache markiert.");
      break;
    case "6":
      if ((d.annahmen?.length ?? 0) < 3) w.push("Weniger als drei Annahmen erfasst.");
      break;
    case "7":
      if (!(d.constraints?.length || d.kiConstraints?.length)) w.push("Keine Constraints festgehalten.");
      break;
    case "8":
      if (!(d.inScope?.length || d.kiInScope?.length)) w.push("In-Scope ist leer.");
      if (!(d.outOfScope?.length || d.kiOutOfScope?.length)) w.push("Out-of-Scope ist leer.");
      if (!(d.sprintFragen?.length || d.kiSprintFragen?.length))
        w.push("Keine Sprint-Frage formuliert – Schritt 9 bleibt sonst leer.");
      break;
    case "9":
      if (leer(d.top1Challenge)) w.push("Keine Top-1-Frage gewählt.");
      if (leer(d.erfolgsmessung)) w.push("Erfolgsmessung fehlt.");
      break;
    case "10":
      if (!d.preSprintTodos?.length) w.push("Keine Pre-Sprint-To-dos.");
      break;
  }
  return w;
}
