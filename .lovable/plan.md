# Video-Bereich aufklappbar machen (Standard: eingeklappt)

## Ziel
Auf der Einführungsseite des Problem-Framing-Workshops bleibt die Reihenfolge wie gewünscht:
1. Erklärung „Warum Problem Framing vor dem Design Sprint?" (aufklappbar)
2. „So arbeitest du mit dem Tool" (Video)
3. Rest der Seite (Eigene Anmerkungen usw.)

Der Video-Bereich wird wie die Erklärung zu einer aufklappbaren Box – **standardmässig eingeklappt**.

## Umsetzung

### `src/components/framing/FramingStepCard.tsx` (IntroSlide)
- Der bisher immer sichtbare Video-Block („So arbeitest du mit dem Tool" + `IntroVideo`) wird in ein `Collapsible` verpackt – gleicher Stil wie die Erklärungsbox darüber (Karte mit Rahmen, Titel links, runder Chevron-Badge rechts, dreht sich beim Öffnen).
- Standardzustand: **zugeklappt** (kein `defaultOpen`).
- Beim Aufklappen erscheint das Video (bzw. der Platzhalter „Video folgt in Kürze") wie bisher im 16:9-Rahmen.
- Reihenfolge bleibt: Erklärung → Video → Eigene Anmerkungen.

## Nicht geändert
- Inhalt und Logik des Videos (`IntroVideo`, `useVideoSlot("framing_intro")`, Fallback auf `INTRO_VIDEO_URL`).
- Die Erklärungsbox und alle anderen Bereiche der Einführungsseite.
- Der Sprint-Einführungsbereich (dort gibt es aktuell keinen Video-Slot; der Slot „sprint_intro" in der Video-Bibliothek bleibt für später reserviert).

## Prüfung
- Typecheck (`npx tsgo --noEmit -p tsconfig.app.json`).
- Playwright-Check auf der Framing-Einführungsseite: Video-Box ist eingeklappt, lässt sich öffnen, Reihenfolge stimmt.
