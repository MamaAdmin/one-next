# Videoserien für den Problem-Framing-Workshop

Ziel: 13 zusammenhängende Clips unter einer Serie, gemeinsame Einstellungen einmal setzen, Clips aus einem Markdown-Skript importieren und Skripte/Zeichnungen als Sammelaktion nacheinander erzeugen. Einzelvideos ohne Serie bleiben unverändert.

## Migration

Neue Tabelle `whiteboard_video_series`:
- Felder: `title`, `description`, `style`, `script_type`, `voice`, `image_model`, `voice_model`, `video_model`, `user_id`, plus `id`, `created_at`, `updated_at`
- Grants für `authenticated` und `service_role`, RLS aktiv
- Zugriffsregel wie bei den bestehenden Lernvideos: nur Administratoren können Serien sehen und bearbeiten. Die heutige Videotabelle hat genau eine Regel („Admins verwalten Lernvideos"), es gibt dort kein Besitzerrecht für normale Nutzer. Ich halte das identisch, damit sich Serien und Videos gleich verhalten.
- `updated_at`-Trigger wie bei den übrigen Tabellen

Erweiterung `whiteboard_videos`:
- `series_id uuid null references whiteboard_video_series(id) on delete set null`
- `position integer null`
- Index auf `(series_id, position)`

Beide Spalten sind optional, bestehende Videos bleiben unberührt.

## Betroffene Dateien

- `src/features/whiteboard/types.ts` – Typ `WhiteboardVideoSeries`, `series_id` und `position` am Projekt-Typ
- `src/features/whiteboard/series.ts` (neu) – Laden/Anlegen/Ändern von Serien, Clips einer Serie, Umsortieren, Markdown-Import-Parser
- `src/pages/admin/WhiteboardVideoDashboard.tsx` – Bereich „Serien" oben mit Karte je Serie (Titel, Anzahl Clips, Status-Zusammenfassung, Link) und Knopf „Neue Serie"
- `src/pages/admin/WhiteboardSeriesDetail.tsx` (neu) – Serienseite unter `/admin/whiteboard-videos/serie/:seriesId`
- `src/components/admin/SeriesImportDialog.tsx` (neu) – Dialog „Clips aus Skript importieren" mit Vorschau und Auswahl
- `src/pages/admin/WhiteboardVideoEditor.tsx` – Breadcrumb mit Serienname, „Clip 4 von 13", Sprung zu vorherigem/nächstem Clip
- `src/App.tsx` – neue Route

Nicht angefasst: Einzelvideo-Ansicht in ihrer Funktion, Remotion-Renderer, die beiden Edge Functions.

## Serienseite

- Kopf: Titel, Beschreibung, gemeinsame Einstellungen (Stil, Skriptart, Stimme, Bild-, Sprach- und Videomodell) einmalig
- Beim Speichern einer geänderten Einstellung ein Dialog mit zwei Möglichkeiten: nur für neue Clips übernehmen, oder auf alle bestehenden Clips der Serie anwenden
- Darunter die Clipliste in Reihenfolge: Position, Titel, Status, Link in den Editor, Pfeil hoch/runter zum Umsortieren (Positionen werden getauscht und gespeichert), Löschen

## Import aus Markdown

- Trennung an `## `-Überschriften; die Überschrift wird der Titel
- Der Absatz nach der Zeile „Sprechtext" wird das Briefing
- Zeilen unter „Bildregie", „Beispiel-Eingaben" und „Merksatz" werden mit ihrer Bezeichnung davor an das Briefing angehängt
- Vorschau: Liste der erkannten Clips mit Titel und Anfang des Briefings, je Eintrag abwählbar
- Angelegt werden Videozeilen mit `series_id`, `position`, `title`, `topic` sowie den gemeinsamen Einstellungen der Serie. Skript, Bilder und Ton bleiben leer.

## Sammelaktionen

- „Alle Skripte erzeugen" und „Alle Zeichnungen erzeugen"
- Vorab ein Bestätigungsdialog mit der Summe über alle Clips, gerechnet mit `estimateCost`, und dem verfügbaren Guthaben; reicht das Guthaben nicht, wird der Start blockiert mit Angabe der fehlenden Credits
- Ablauf streng nacheinander, ein Clip nach dem anderen, mit Fortschrittsanzeige „Clip 3 von 13" und Abbrechen-Knopf (bricht nach dem laufenden Clip ab)
- Fehler bei einem Clip stoppen den Lauf nicht; am Ende erscheint eine Liste der fehlgeschlagenen Clips
- Verbrauch wird wie heute je Clip protokolliert

## Offene Fragen

1. Zugriff: Ich setze Serien auf „nur Administratoren", genau wie die heutigen Lernvideos. Ein echtes Besitzerrecht für Nicht-Admins gibt es dort bisher nicht — soll das so bleiben?
2. „Alle Zeichnungen erzeugen" ergibt nur bei Clips mit fertigem Skript Sinn. Sollen Clips ohne Skript übersprungen werden (mein Vorschlag) oder soll der Lauf sie melden und anhalten?
3. Sollen die Sammelaktionen Clips überspringen, die bereits ein Skript beziehungsweise Bilder haben, um keine Credits doppelt zu verbrauchen?
4. Beim Löschen einer Serie: Clips bleiben erhalten und werden zu Einzelvideos (durch `on delete set null`). Ist das gewünscht, oder soll zusätzlich gefragt werden, ob die Clips mitgelöscht werden?
