# Kie.ai Modell-Katalog mit KI-Berater

Aus dem Whiteboard-Video-Maker wird ein Werkzeug, das dir für jeden Zweck das passende Kie.ai-Modell vorschlägt. Grundlage ist ein gepflegter Katalog aller Kie.ai-Modelle mit Abgleich-Hilfe, dazu ein Berater, dem du dein Vorhaben in eigenen Worten beschreibst.

Hintergrund: Kie.ai bietet keine Schnittstelle, die alle Modelle automatisch ausliest. Die aktuelle Liste steht auf der Market-Seite und in der Dokumentation. Der Katalog wird deshalb in deinem Backend geführt und über eine Abgleich-Funktion aktuell gehalten.

## 1. Katalog erweitern

Die bestehende Modell-Tabelle (heute nur Name, Kategorie, Einheit, Credits) bekommt zusätzliche Felder:

- Anzeigename und Anbieter (z. B. Google, ByteDance, ElevenLabs)
- Kurzbeschreibung auf Deutsch
- Stärken und typische Einsatzzwecke (z. B. „Erklärvideo“, „Produktfoto“, „Vertonung“, „Musik“)
- Qualitätsstufe (Entwurf / Standard / Premium) und Geschwindigkeit
- Ein-/Ausgabe-Arten (Text, Bild, Video, Audio)
- Link zur Kie.ai-Dokumentation
- Empfohlen ja/nein, aktiv ja/nein, Quelle und Stand der letzten Prüfung

Ein Startkatalog wird mit den heute wichtigen Kie.ai-Modellen befüllt (Bild, Video, Sprache, Musik, Text), inklusive der Modelle, die der Whiteboard-Generator schon nutzt.

## 2. Neue Seite „KI-Modelle“ im Admin

Eigene Seite unter `/admin/ki-modelle`, verlinkt aus dem Admin-Menü und aus der Whiteboard-Übersicht:

- Karten-/Tabellenansicht aller Modelle
- Filter nach Kategorie, Einsatzzweck, Qualität und Budget
- Suche nach Name
- Pro Modell: Beschreibung, Stärken, Credits pro Einheit, Doku-Link, Status
- Modelle anlegen, bearbeiten, deaktivieren
- Die bestehende Preisverwaltung zieht in diese Seite um, damit alles an einem Ort ist

## 3. Abgleich-Hilfe

Ein Button „Mit Kie.ai abgleichen“ ruft serverseitig die Kie.ai-Dokumentation ab, vergleicht sie mit dem Katalog und zeigt eine Vorschlagsliste:

- neue Modelle, die noch fehlen
- Modelle, die es bei Kie.ai offenbar nicht mehr gibt
- geänderte Angaben

Nichts wird automatisch überschrieben: Du übernimmst jeden Vorschlag einzeln oder verwirfst ihn. Der Zeitpunkt des letzten Abgleichs wird angezeigt.

## 4. KI-Berater mit Freitext

Ein Eingabefeld „Was möchtest du erstellen?“ – zum Beispiel „Ein 60-Sekunden-Erklärvideo für Führungskräfte mit ruhiger Stimme, günstig“.

Die KI bekommt den aktuellen Katalog und antwortet mit:

- 2–3 empfohlenen Modellen je benötigter Rolle (Bild, Sprache, Video)
- Begründung in einem Satz pro Modell
- geschätztem Credit-Bedarf für das beschriebene Vorhaben
- einer günstigeren Alternative

Die Beratung läuft über die in Lovable enthaltene KI, verbraucht also kein Kie.ai-Guthaben. Jede Empfehlung wird gespeichert, damit du sie später wieder ansehen kannst.

## 5. Empfehlung übernehmen

Zu jeder Empfehlung gibt es „Für dieses Video übernehmen“:

- Auswahl eines vorhandenen Whiteboard-Videos oder Anlegen eines neuen
- Das empfohlene Bild-, Sprach- bzw. Videomodell wird dort gesetzt
- Im Video-Editor erscheinen die gewählten Modelle sichtbar über der Kostenübersicht und lassen sich dort wechseln
- Die Kostenschätzung und die Verbrauchserfassung rechnen automatisch mit dem gewählten Modell

## Technische Umsetzung

- Migration: `kie_models` um `display_name`, `provider`, `description_de`, `strengths`, `use_cases` (Text-Array), `quality_tier`, `speed_tier`, `input_modalities`, `output_modalities`, `docs_url`, `recommended`, `source`, `last_checked_at` erweitern; Startdaten per Upsert auf `name`. Neue Tabelle `model_recommendations` (user_id, prompt, result JSONB, applied_video_id) und `kie_catalog_sync_runs` (Stand, Rohergebnis, Vorschläge) mit Admin-RLS und GRANTs.
- `whiteboard_videos` um `image_model`, `voice_model`, `video_model` erweitern; die Edge Function `kie-whiteboard` nimmt das Modell künftig als Parameter statt fest verdrahtet, mit den heutigen Werten als Standard.
- Neue Edge Function `kie-catalog`: Aktion `sync` lädt `https://docs.kie.ai/llms.txt` plus verlinkte Market-Seiten und lässt die Lovable-KI daraus strukturierte Modelldaten extrahieren; Aktion `advise` erzeugt die Empfehlung aus Freitext und Katalog (strukturierte JSON-Antwort, deutschsprachig).
- Frontend: `src/pages/admin/KieModelCatalog.tsx`, Komponenten `ModelCatalogGrid`, `ModelAdvisor`, `CatalogSyncPanel`, `ModelEditDialog`; `KieModelPricing` wird in die neue Seite integriert; `src/features/whiteboard/pricing.ts` liest die Modellwahl künftig aus dem Projekt statt aus Konstanten.
- Fehlerbehandlung: nicht erreichbare Doku, KI-Limit, leere Antwort und fehlende Modellrechte werden auf Deutsch gemeldet; die Videoerstellung bleibt auch ohne Katalogdaten funktionsfähig.
