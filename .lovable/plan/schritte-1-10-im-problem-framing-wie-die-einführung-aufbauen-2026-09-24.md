# Schritte 1–10 im Problem Framing wie die Einführung aufbauen

## Ziel
Jede Übung (Schritt 1 bis 10) folgt derselben Reihenfolge wie die Einführungsseite:

1. **Erklärung** – aufklappbare Box (gleicher Stil wie „Warum Problem Framing vor dem Design Sprint?"), Inhalt: was in diesem Schritt passiert und „Warum jetzt?". Standardmässig aufgeklappt.
2. **So arbeitest du mit dem Tool** – Video-Box, **standardmässig eingeklappt**. Zeigt das Video für diesen Schritt oder den Platzhalter „Video folgt in Kürze".
3. **Der Rest** – Übung wie bisher (Eingaben, KI-Vorschläge, Hinweise, Buttons).

Titel, Timebox und Leitfrage bleiben oben stehen. Auf der Einführungsseite bleibt das Video wie bisher sichtbar.

## Videos pro Schritt austauschbar
In der Video-Bibliothek erscheinen zehn neue Einsatzorte: „Problem Framing · Schritt 1" bis „Schritt 10". So kannst du jedem Schritt ein eigenes Video zuweisen. Ohne Zuweisung erscheint der Platzhalter.

## Technische Details
- `src/features/video/slots.ts`: Slots `framing_step_1` … `framing_step_10` ergänzen.
- `src/components/framing/FramingStepCard.tsx`:
  - Neue Komponenten `StepExplanation` (Collapsible, defaultOpen, enthält `step.arbeit` + `step.nutzen`) und `StepVideo` (Collapsible, zugeklappt, `useVideoSlot("framing_step_" + step.key)` → `VideoPlayer`).
  - Im Header nur Badge, Titel, Leitfrage (inkl. NUF-Link) belassen; danach Erklärung → Video → `ExternalLlmBar` → `StepVariant` usw.
  - Chevron-Badge-Stil wie bestehende Intro-Box.
- Keine Änderungen an Daten, Validierung, Abschluss-Panel oder Navigation.

## Prüfung
Typecheck und Playwright-Check in Schritt 1 und 9: Reihenfolge stimmt, Video eingeklappt und aufklappbar.
