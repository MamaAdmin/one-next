# Aus der Slideshow ein echtes Video machen

Heute erzeugt das Tool pro Abschnitt ein Standbild (1:1, 1K) und blendet es mit einer Handanimation ein. Deshalb wirkt das Ergebnis wie eine vertonte Präsentation. Zwei Hebel ändern das grundlegend: bewegte Bilder aus Kie.ai und echte Kamera-/Schnittarbeit in Remotion.

## Phase 1 – Bewegte Bilder statt Standbilder (Kie.ai)

- Neuer Abschnittstyp "KI-Clip": Das erzeugte Standbild wird per Bild-zu-Video (Veo bzw. Kling über Kie.ai) in 5–8 Sekunden Bewegung verwandelt. Das Bild bleibt Ausgangsframe, die Bewegung wird beschrieben (Kamerafahrt, Figur bewegt sich, Elemente erscheinen).
- Bewegungsbeschreibung wird zusätzlich zur Bildbeschreibung im Skript erzeugt (ein Satz pro Abschnitt, deutsch).
- Pro Abschnitt frei wählbar: Zeichnung (günstig), KI-Clip (teuer), eigene Aufnahme (wie bisher). Mischbetrieb in einem Video.
- Kostenschätzung und Bestätigungsdialog rechnen KI-Clips mit Sekunden × Credits mit, inklusive Guthabenprüfung vor dem Start.
- Bilder künftig in 16:9 und 2K statt 1:1/1K – füllt den Rahmen, kein Beschnitt mehr.

## Phase 2 – Optische Einheitlichkeit über alle Abschnitte

- Ein fester Zufallswert (Seed) pro Video, damit Figuren, Farben und Strichführung über alle Abschnitte gleich bleiben.
- Das erste erzeugte Bild dient als Stilreferenz für alle weiteren Bilder eines Videos bzw. einer Serie.
- Negativbeschreibung ("kein Text, keine Wasserzeichen, keine verzerrten Hände") zentral hinterlegt.

## Phase 3 – Echte Kamera- und Schnittarbeit (Remotion)

- Kamerabewegung auf jedem Standbild: langsames Heranfahren, Schwenk, Parallaxe – nie ein stehendes Bild.
- Übergänge zwischen Abschnitten statt hartem Schnitt: gleitendes Wischen, Wegzoomen, Whip-Pan – ein einheitliches Set, nicht pro Szene ein anderer Trick.
- Untertitel wortweise passend zur Stimme eingeblendet (Karaoke-Stil), statt statischer Aufzählungspunkte.
- Stichpunkte erscheinen zeitversetzt zum Sprechtext, nicht alle auf einmal.
- Hintergrundmusik (eine Spur pro Video, wählbar, Lautstärke sinkt automatisch unter der Stimme) und kurze Klangakzente bei Einblendungen.
- Durchgehende Bild-im-Bild-Elemente: Fortschrittsanzeige, Kapitelnummer, dezentes Logo – sorgt für Serienlook über alle 13 Clips.
- Abschnittsdauer richtet sich exakt nach der Länge der Sprachdatei statt nach einer Schätzung.

## Phase 4 – Ausgabe in Kinoqualität

- Export bleibt im Browser (Remotion Web-Renderer), aber mit wählbarer Auflösung (1080p) und sauberer Tonmischung aus Stimme, Musik und Clipton.
- Vorschau bleibt wie gewohnt im Editor.

## Reihenfolge

Phase 3 bringt sofort den größten sichtbaren Sprung ohne Zusatzkosten. Phase 1 und 2 bringen echte Bewegung, kosten aber Kie.ai-Credits. Ich empfehle Phase 3 zuerst, dann Phase 1/2, Phase 4 zum Schluss.

## Technische Details

- Datenmodell `WhiteboardScene`: `mediaType` um `"ai_clip"` erweitern, plus `motionPrompt`, `aiClipUrl`, `aiClipTaskId`, `seed`; alle Felder optional, bestehende Abschnitte rendern unverändert.
- `supabase/functions/kie-whiteboard`: `image` auf `aspect_ratio: "16:9"`, `resolution: "2K"`, `seed` und `negative_prompt` erweitern; `video_start` um `generationType: "IMAGE_2_VIDEO"` mit `imageUrls` und `duration` ergänzen; Ergebnis wie bisher in `whiteboard-assets` spiegeln.
- `supabase/functions/whiteboard-script`: JSON-Schema um `motionPrompt` je Szene erweitern (Prompt und Sprache unverändert deutsch).
- `src/features/whiteboard/renderers.tsx`: gemeinsames Bewegungssystem (Ken-Burns-Helfer, einheitliche Ein-/Ausgänge), `AIClipStage` analog zu `ClipStage`, wortweise Untertitel aus `narration` mit Zeitverteilung über die Audiolänge.
- `src/features/whiteboard/WhiteboardVideo.tsx`: von manueller `Sequence`-Kette auf `TransitionSeries` umstellen, Musikspur als globales `Audio` mit Ducking, persistente Overlay-Ebene.
- `src/features/whiteboard/pricing.ts`: `ai_clip`-Abschnitte mit Sekunden × Videopreis rechnen, Bildkosten weiter für `image`-Abschnitte.
- `src/pages/admin/WhiteboardVideoEditor.tsx`: Dreifach-Umschaltung je Abschnitt, Feld Bewegungsbeschreibung, Cliplänge, Bestätigungsdialog mit Gesamtkosten.
- Unverändert: Serien-Datenmodell, eigene Aufnahmen (`whiteboard-uploads`), Breadcrumbs, Stilbibliothek-Struktur.

## Offene Fragen

- Soll ich alle vier Phasen umsetzen oder mit Phase 3 (Bewegung und Schnitt, kostenlos) starten?
- Woher soll die Hintergrundmusik kommen – eigene Dateien hochladen oder eine kleine mitgelieferte Auswahl?
