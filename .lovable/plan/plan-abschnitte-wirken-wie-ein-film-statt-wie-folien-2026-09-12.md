# Plan: Abschnitte wirken wie ein Film statt wie Folien

## Problem
Heute ist jeder Abschnitt ein starres Split-Layout: Bild in einem Kasten links,
Überschrift und alle Stichpunkte gleichzeitig rechts. Das liest sich wie eine
PowerPoint-Folie. Der Screenshot zeigt genau das (Kasten mit "Zeichnung noch
nicht erzeugt" links, Titel und drei Striche rechts).

## Ziel
Das Bild (Zeichnung, KI-Clip oder Aufnahme) ist die Bühne und füllt den ganzen
Frame. Text liegt als animierte Einblendung darüber und folgt dem Sprechtext –
nicht alles auf einmal, kein sichtbarer "Folien-Rahmen".

## Änderungen in `src/features/whiteboard/renderers.tsx`

Neuer gemeinsamer Aufbau für alle Stile (Whiteboard, Flat, Motion Graphics,
Infografik, 3D, Avatar):

1. **Vollbild-Bühne**: Das Bild/der Clip füllt den kompletten 1920x1080-Frame
   (`objectFit: cover`, mit ruhiger Kamerafahrt über Ken Burns). Kein Kasten,
   kein Rahmen, kein gestrichelter Platzhalter mit "Zeichnung noch nicht erzeugt"
   – stattdessen eine leere Bühne mit dezentem Hinweis unten (nur Editor-Vorschau
   relevant, im fertigen Video ohnehin nie leer).

2. **Text als Einblendung (Lower Third)**: Weiche dunkle Verlaufsblende am
   unteren Rand, darüber die Überschrift groß und animiert (je Stil: Handschrift
   mit Hand beim Whiteboard-Stil, Spring/Fade bei den anderen).

3. **Stichpunkte nacheinander, nicht alle gleichzeitig**: Die bis zu 4 Punkte
   werden über die Abschnittsdauer verteilt (gleichmäßig nach Dauer in Frames),
   erscheinen einzeln mit Bewegung. Der gerade aktuelle Punkt ist groß und
   farbig hervorgehoben; bereits gezeigte Punkte verblassen klein darüber.
   So folgt das Bild der Erzählung statt einer Liste.

4. **Szenennummer dezent**: Die große "02" über dem Titel entfällt aus der
   Bildmitte; Kapitel/Fortschritt bleibt nur in der schon vorhandenen
   Overlay-Leiste oben.

5. **Screencast-Ansicht behalten**: Die Fenster-Optik für Aufnahmen bleibt,
   aber ihre Textkarte bekommt dasselbe zeitversetzte Verhalten.

6. **Kinetic Typography bleibt** wie sie ist (ist bereits wortbasiert animiert).

## Was sich NICHT ändert
- Keine Datenbank- oder Type-Änderung (`WhiteboardScene` bleibt).
- `WhiteboardVideo.tsx` (Titelkarte, Übergänge, Musik, Untertitel) bleibt.
- Editor, Generierung über Kie.ai/Gemini, Serien, Kostenrechnung bleiben.
- Reine Umbauarbeit in `renderers.tsx` (+ ggf. kleine Helper in `motion.ts`).

## Betroffene Dateien
- `src/features/whiteboard/renderers.tsx` – Scene-Views umbauen (Hauptarbeit)
- `src/features/whiteboard/motion.ts` – nur falls ein Timing-Helper fehlt

## Prüfung danach
- TypeScript-Check ohne Fehler.
- Vorschau eines bestehenden Videos mit Bildern: Vollbild, Punkte erscheinen
  nacheinander, kein Folien-Rahmen mehr.
