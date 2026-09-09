# Überlappender Anfang beheben und Stilbibliothek aufbauen

## 1. Überlappende Texte am Anfang

Ursache ist bestätigt: Die Titelkarte läuft ab Sekunde 0 und die erste Szene startet ebenfalls bei 0 – beide werden gleichzeitig gezeichnet. Der Titel bekommt künftig seinen eigenen Zeitblock, die Szenen starten erst danach. Zusätzlich wird die Titelzeile umbruchfähig gemacht, damit lange Titel nicht aus dem Bild laufen.

## 2. Stilbibliothek mit Beispielvideos

Neue Seite „Stilbibliothek“ im Admin-Bereich sowie eine Stilauswahl direkt im Video-Editor. Jeder Stil zeigt:

- Name und visuelle Merkmale
- Wofür der Stil geeignet ist
- Passende Skriptart
- Link zu einem Beispielvideo (öffnet in neuem Tab)
- Vorschaubild des Stils

Enthaltene Stile (aus der Recherche):
Whiteboard/Legetrick, Flat 2D/Vektor, 2D Character Animation, Motion Graphics, Infografik-Animation, Screencast/UI-Demo, Screencast plus Animation, 3D/Isometric, Kinetic Typography, Avatar/Presenter, Mixed Media, Live-Action.

Live-Action und Mixed Media lassen sich mit Bildgenerierung nicht sinnvoll nachbauen; sie erscheinen als Referenz mit dem Hinweis „nur als Vorlage, keine automatische Erzeugung“. Alle anderen Stile sind auswählbar.

Zusätzlich ein Hilfsblock „Welcher Stil passt zu meinem Lernziel?“ mit der Zuordnungstabelle aus der Recherche (Begriff verstehen, Software bedienen, Prozess verstehen, Verhalten ändern, Technik erklären, Pflichtschulung).

## 3. Eigene Animation je Stil

Der Videoaufbau richtet sich nach dem gewählten Stil, nicht mehr nur die Zeichnung:

- **Whiteboard:** wie heute – zeichnende Hand, Wisch-Aufbau, Papierhintergrund.
- **Flat 2D / Character:** flächiger Hintergrund, Bilder faden und skalieren sanft ein, Stichpunkte gleiten nacheinander herein.
- **Motion Graphics / Infografik:** dunkler Rasterhintergrund, Zahlen und Stichpunkte erscheinen als bewegte Kacheln, Bild rechts mit Rahmenaufbau.
- **Screencast:** Bild bildschirmfüllend mit Fensterrahmen, Text als Callout-Blase daneben, sanfter Zoom.
- **3D / Isometric:** dunkler Verlauf, leichte Kamerafahrt (Parallax) über dem Bild.
- **Kinetic Typography:** kein Bild nötig – Text groß, wortweise im Takt eingeblendet.
- **Avatar / Presenter:** Figur links konstant, Textblock rechts baut sich auf.

Titelkarte und Farbwelt (Papier, Tafel, dunkel, hell) passen sich ebenfalls dem Stil an.

## 4. Skriptart beim Briefing

Neben Thema, Stil und Stimme wird eine Skriptart gewählt. Die Skript-KI schreibt das Skript dann nach der gewählten Dramaturgie:

Problem–Lösung, How-to/Tutorial, Story-driven, „Was ist …?“, Vorher–Nachher, Mythos–Fakt, Daten/Infografik, Fallstudie, Demonstration, Compliance/Unterweisung, Microlearning.

Die Auswahl wird pro Video gespeichert und beeinflusst nur den Skripttext, nicht die Kosten.

## Technische Details

- `src/features/whiteboard/WhiteboardVideo.tsx`: Titel-`Sequence` bekommt eine feste Dauer, `cursor` startet bei dieser Dauer statt 0; Titeltext mit `overflowWrap`/`maxWidth`. Neue Datei `renderers/` mit einer Szenenkomponente je Stilfamilie (`WhiteboardScene`, `FlatScene`, `MotionScene`, `ScreencastScene`, `IsometricScene`, `TypographyScene`, `AvatarScene`) plus Stil-Theme (Hintergrund, Ink, Akzent, Schrift); Auswahl über eine Map.
- `src/features/whiteboard/styles.ts`: ersetzt die bisherigen sechs Werte durch die Stilbibliothek – `value`, `label`, `merkmale`, `eignung`, `skriptart`, `beispielUrl`, `promptSuffix` (englisch, für die Bildmodelle), `renderer`, `generierbar`.
- Neue Datei `src/features/whiteboard/scriptTypes.ts`: Skriptarten mit `value`, `label`, `ablauf`, `promptHinweis`.
- Migration: Spalte `script_type` (text, Default `problem_loesung`) auf `whiteboard_videos`; bestehende `style`-Werte werden auf die neuen Schlüssel gemappt (`strichzeichnung` → `whiteboard`, `business_flat` → `flat_2d`, `comic` → `character_2d`, Rest → `whiteboard`).
- `supabase/functions/whiteboard-script/index.ts`: nimmt `scriptType` entgegen und ergänzt den deutschen Prompt um Dramaturgie-Vorgabe und Hook-Regel; Bildbeschreibungen erhalten weiterhin den Stil-Suffix.
- `supabase/functions/kie-whiteboard/index.ts`: Stil-Mapping auf die neuen Schlüssel umstellen.
- Neue Seite `src/pages/admin/StyleLibrary.tsx` unter `/admin/stilbibliothek`, verlinkt vom Whiteboard-Dashboard; Karten-Grid mit Beispiel-Link (`target="_blank" rel="noopener noreferrer"`) und Lernziel-Tabelle.
- `src/pages/admin/WhiteboardVideoEditor.tsx`: Stil- und Skriptart-Auswahl mit Kurzbeschreibung und Link zur Stilbibliothek; Preview-Player rendert die stilabhängige Komposition.
- Vorschaubilder pro Stil werden generiert und unter `src/assets/styles/` abgelegt.
- Design ausschliesslich über bestehende Tokens; keine harten Farben in Komponenten (Remotion-Komposition behält ihre eigenen Stilkonstanten).
