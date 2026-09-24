# Whiteboard-Video: zwei Export-Wege zur Auswahl

Im Whiteboard-Editor gibt es beim Export künftig eine Auswahl:

1. **Im Browser exportieren (ohne Creatomate)** – wie bisher, kostenlos, dauert je nach Länge einige Minuten, Seite muss offen bleiben.
2. **Auf dem Server exportieren (mit Creatomate)** – schneller, Seite darf geschlossen werden, verbraucht Creatomate-Guthaben. Fertiges MP4 wird gespeichert und bleibt als Download im Editor verfügbar.

Zusätzlich: Untertitel als SRT-Datei herunterladen (beide Wege).

## Ablauf für dich
- Knopf „Video exportieren“ öffnet ein kleines Fenster mit beiden Optionen, kurzer Erklärung zu Dauer und Kosten.
- Beim Server-Export: Statusanzeige (in Warteschlange, wird gerendert, fertig, fehlgeschlagen) und danach „MP4 herunterladen“.
- Hinweis bei Server-Export: Handzeichnungs-Animation und Formen werden vereinfacht (Bilder mit ruhiger Kamerafahrt, Titel, Untertitel, Musik, Clips). Der Browser-Export zeigt den exakten Vorschau-Look.

## Nebenbei behoben
- Der Browser-Export bricht bei Abschnitten mit Bewegtbild ab (Fehlermeldung zu nicht unterstütztem Video-Baustein). Clips nutzen künftig immer den exporttauglichen Baustein.

## Technische Details
- `renderers.tsx` `ClipStage`: immer `Video` aus `@remotion/media` (trimBefore/trimAfter), `remotion`-`Video` entfernen.
- Neue Migration: `whiteboard_videos` um `render_id`, `render_status`, `render_error`, `export_path`, `export_srt_path` (text, nullable).
- `render-video` Edge Function um Modus `source: "whiteboard"` erweitern: lädt Video per ID, signiert Bild-/Audio-/Clip-/Musik-Pfade, baut Creatomate RenderScript (Szenen nacheinander, Bild mit Zoom oder Clip, Sprecher-Audio, Titelkarte, Untertitel-Text, Musik mit Absenkung), Polling, MP4/SRT in privaten Speicher, Status in `whiteboard_videos`. Admin-Prüfung bleibt.
- Editor: Export-Dialog mit Radio-Auswahl, Polling alle 5 s bis fertig, signierter Download-Link. SRT-Erzeugung über bestehende `toSrt`-Logik aus Sprechtext und Szenendauer.
