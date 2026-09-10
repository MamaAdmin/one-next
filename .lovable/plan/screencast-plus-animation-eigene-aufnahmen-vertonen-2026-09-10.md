# Screencast plus Animation: eigene Aufnahmen vertonen

Ziel: Für einzelne Abschnitte lädst du eine Bildschirmaufnahme hoch statt eine KI-Zeichnung erzeugen zu lassen. Das Tool schneidet sie, legt die erzeugte Sprecherstimme darüber, blendet Merksätze ein und gibt wie bisher ein MP4 aus.

## Storage

- Neuer privater Bucket `whiteboard-uploads`, 200 MB pro Datei.
- Schreiben (Insert/Update/Delete) nur für Administratoren, Lesen ebenfalls nur für Administratoren; Wiedergabe im Editor und beim Rendern über signierte URLs mit Ablaufzeit.
- Dateipfad `video/<videoId>/<sceneId>-<zeitstempel>.<endung>`.
- Prüfung schon im Browser: nur `video/mp4` und `video/webm`, maximal 200 MB. Bei Verstoß eine verständliche deutsche Meldung, kein Upload.
- Da signierte Links ablaufen, wird die URL nicht dauerhaft gespeichert, sondern im Abschnitt der Storage-Pfad (`clipPath`); der Editor und der Renderer holen sich daraus jeweils eine frische signierte URL. `clipUrl` bleibt als Feld erhalten und trägt die jeweils aktuelle Adresse.

## Datenmodell

`WhiteboardScene` in `src/features/whiteboard/types.ts` wird ergänzt:

- `mediaType?: "image" | "clip"` (fehlt der Wert, gilt "image")
- `clipPath?: string | null`, `clipUrl?: string | null`
- `clipStartInSeconds?: number`, `clipEndInSeconds?: number`
- `captions?: Array<{ text: string; atSecond: number; durationInSeconds: number }>`

Alle Felder sind optional; bestehende Abschnitte und Serien bleiben unverändert. Keine Datenbankmigration nötig, da Abschnitte als JSON in `whiteboard_videos.scenes` liegen.

## Editor

In `src/pages/admin/WhiteboardVideoEditor.tsx` je Abschnitt:

- Umschalter "Zeichnung" / "Aufnahme".
- Bei "Aufnahme": Upload-Feld, Vorschau im HTML-Videoelement, Felder "Start (Sekunden)" und "Ende (Sekunden)". Ende leer bedeutet bis zum Schluss. Ende muss größer als Start sein.
- Kleiner Einblendungs-Editor: Text, Startsekunde, Dauer, maximal drei Einträge, mit Hinzufügen und Entfernen.
- Bei "Aufnahme" verschwinden Bildbeschreibung und der Knopf zum Zeichnen erzeugen; die Kostenübersicht zählt diesen Abschnitt nicht mehr als Bild.
- Hinweis, wenn die beschnittene Aufnahme kürzer ist als die Sprecherstimme ("letztes Bild wird eingefroren") oder länger ("Aufnahme wird nach der Sprecherstimme abgeschnitten").
- Die Abschnittsdauer bleibt an die Sprecherstimme gekoppelt wie bisher.

## Kosten

`estimateCost` in `src/features/whiteboard/pricing.ts` bekommt die Abschnitte bereits übergeben und zählt künftig nur Abschnitte mit `mediaType !== "clip"` als Bilder. Sprecherstimme und Videoclip bleiben unverändert.

## Remotion

In `src/features/whiteboard/renderers.tsx`:

- Neue Komponente `ClipStage`: `OffthreadVideo` beim Export, `Video` in der Vorschau (Auswahl über Remotions Umgebungsprüfung), mit `startFrom` und `endAt` aus dem Beschnitt.
- Ist die Aufnahme kürzer als der Abschnitt, wird das letzte Bild eingefroren (die Videokomponente endet, ein Standbild-Fallback bleibt sichtbar); ist sie länger, endet sie am Beschnittende.
- `CaptionCards`: Textkarten unten links, weich ein- und ausgeblendet, Schriftart und Farben aus dem bestehenden Theme.
- Alle Szenen-Renderer nutzen für `mediaType === "clip"` die `ClipStage` anstelle der Zeichnung; sonst bleibt alles wie heute. Der Whiteboard-Renderer selbst wird nicht umgebaut.
- Die Sprecherstimme läuft weiter über `SceneAudio`; die Videospur wird stumm geschaltet.

## Stilbibliothek

In `src/features/whiteboard/styles.ts`: `screencast_plus` wieder `generierbar: true` mit dem Hinweis "Aufnahme selbst hochladen, Vertonung und Einblendungen erzeugt das Tool." `screencast` bleibt "Nur Vorlage".

## Nicht angefasst

Bild- und Tonerzeugung über `kie-whiteboard`, das Datenmodell der Serien, der bestehende Whiteboard-Renderer in seiner Zeichenlogik.

## Offene Fragen

1. Soll der Ton der Aufnahme immer stumm bleiben (mein Vorschlag), oder brauchst du ihn leise im Hintergrund?
2. Sollen die Einblendungen auch bei Abschnitten mit Zeichnung möglich sein, oder nur bei Aufnahmen?
