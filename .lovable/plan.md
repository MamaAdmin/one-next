# Skript über Gemini, Medien über Kie.ai, Stimmen zum Reinhören

## Was sich ändert

1. **Thema / Briefing (Skripterstellung) läuft künftig über die in Lovable enthaltene KI (Gemini)**
   statt über Kie.ai. Damit kostet das Schreiben des Skripts keine Kie.ai-Credits mehr.
   Bilder, Sprecherstimmen und KI-Videoclips bleiben unverändert bei Kie.ai.

2. **Stimmen zum Reinhören**: Neben der Stimmenauswahl gibt es einen Abspielen-Knopf.
   Damit wird ein kurzer deutscher Beispielsatz mit der gewählten Stimme erzeugt und
   direkt im Browser abgespielt. Jede Beispielaufnahme wird gespeichert und wiederverwendet,
   sodass dieselbe Stimme nur einmal Credits kostet. Vor dem ersten Abspielen einer Stimme
   wird der kleine geschätzte Verbrauch angezeigt.

## Auswirkungen auf die Kostenanzeige

- Die Zeile „Skript" in der Kosten-Übersicht zeigt künftig „über Lovable KI, keine
  Kie.ai-Credits" statt eines Kie.ai-Preises.
- Die Guthabenprüfung vor der Skripterstellung entfällt, weil kein Kie.ai-Guthaben nötig ist.
- Die Erfassung des Verbrauchs für Bilder, Stimme und Videoclip bleibt wie bisher.

## Technische Umsetzung

- Neue Edge Function `whiteboard-script`: ruft `https://ai.gateway.lovable.dev/v1/chat/completions`
  mit `LOVABLE_API_KEY` und einem Gemini-Chatmodell auf (exakte Modell-ID wird vor der
  Umsetzung aus der Modellliste des Gateways gelesen), gleicher deutscher Prompt und gleiches
  JSON-Antwortformat wie heute in `kie-whiteboard` (`action: "script"`), gleiche Admin-Prüfung
  über `has_role`. Fehlerbehandlung nach Gateway-Semantik: 429/5xx mit Backoff, 402/403 mit
  klarer deutscher Meldung, kein automatischer Wiederholungslauf bei 400/401.
- `kie-whiteboard`: `action: "script"` und `generateScript()` entfallen; alle übrigen Aktionen
  (`credits`, `image`, `voice`, `video_start`, `video_status`) bleiben unverändert.
- Neue Aktion `voice_preview` in `kie-whiteboard`: erzeugt aus einem festen Beispielsatz mit
  `voice` + `model` eine MP3, speichert sie unter einem deterministischen Pfad
  (`previews/<model>-<voice>.mp3`) im Bucket `whiteboard-assets` und liefert eine signierte URL;
  existiert die Datei bereits, wird sie ohne neuen Kie.ai-Auftrag zurückgegeben.
- `src/features/whiteboard/api.ts`: `generateScript()` zeigt auf die neue Function,
  neue Funktion `previewVoice(voice, model)`.
- `src/pages/admin/WhiteboardVideoEditor.tsx`: Abspielen-Knopf neben der Stimmenauswahl mit
  `<audio>`-Wiedergabe und Ladezustand; `runScript()` ohne `ensureBudget`/Kie.ai-Usage-Buchung,
  Skript weiterhin in `generation_jobs` protokolliert (Anbieter „Lovable KI").
- `src/features/whiteboard/pricing.ts`: Skriptzeile als kostenfrei ausweisen, statt sie über
  `kie_models` zu bepreisen.
