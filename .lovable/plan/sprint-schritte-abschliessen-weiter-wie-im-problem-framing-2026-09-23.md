# Sprint-Schritte: „Abschliessen & weiter“ wie im Problem Framing

Im Problem Framing prüft jeder Schritt beim Abschliessen, ob wichtige Angaben fehlen, zeigt einen gelben Hinweis („Noch offen in diesem Schritt“) und lässt trotzdem weitergehen. Im Design Sprint fehlt das: „Weiter“ springt sofort zum nächsten Schritt, ohne auf Lücken hinzuweisen.

## Was sich ändert

- Beim Klick auf „Weiter“ wird der Schritt gespeichert und geprüft. Fehlt etwas Wesentliches, bleibt man auf dem Schritt und sieht den gelben Hinweis mit den offenen Punkten sowie dem Satz „Du kannst trotzdem weiter und später zurückkommen.“
- Der Knopf heisst dann „Trotzdem weiter“; ein zweiter Klick geht weiter.
- Ist alles ausgefüllt, verhält sich der Knopf wie bisher (direkt weiter, im letzten Schritt „Sprint abschliessen“).
- „Zwischenspeichern“ bleibt unverändert und blendet den Hinweis wieder aus.
- Der Hinweis blockiert nie — Schritte bleiben jederzeit überspringbar.

## Welche Hinweise erscheinen

Pro Schritt-Typ, bewusst knapp gehalten:

- Listen-/Vorschlagsschritte: keine Einträge unter „Deine Antworten“; bei Schritten mit Stimmenlimit zusätzlich „Keine Auswahl getroffen“.
- Tabellen-Schritte: keine Zeile erfasst.
- Formular-/Flow-Schritte: Pflichtfelder bzw. Flow-Etappen leer.
- Map, Notizen, Ideen, Crazy 8s, Sketches, Heatmap, Storyboard, Prototyp, Scorecard, Entscheidung, Hot Takes: jeweils „noch nichts erfasst“ bzw. „keine Entscheidung festgehalten“.

## Technische Umsetzung

- Neue Datei `src/features/sprint/validation.ts` mit `getSprintStepWarnings(step: SprintStepDef, data: SprintStepData): string[]` — reine Funktion, nach dem Vorbild von `src/features/framing/validation.ts`, Verzweigung über `step.variant` und `step.stimmenLimit`.
- `src/components/sprint/SprintStepCard.tsx`:
  - `const [warnings, setWarnings] = useState<string[]>([])`, zurückgesetzt beim Schrittwechsel (bestehender Mount-/Step-Effekt).
  - `persist(completed: boolean, force = false)`: bei `completed` Warnungen berechnen und setzen; sind welche vorhanden und `force === false`, wird `onSave(data, { completed: true })` ausgeführt, aber **nicht** navigiert (analog `handleSave` im Framing). Bei `completed === false` Warnungen leeren.
  - Weiter-Button ruft `persist(true, warnings.length > 0)`; Beschriftung „Trotzdem weiter“ solange `warnings.length > 0`.
  - Gelber Hinweisblock direkt über dem Button-Bereich, gleiche Optik wie im Framing (`border-l-4 border-l-amber-500 …`, `AlertTriangle`).
- Keine Änderungen an Datenmodell, Edge Functions oder Schritt-Navigation.
