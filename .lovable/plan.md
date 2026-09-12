# Skripterzeugung auf eigenes Gemini umstellen

Ziel: Die Skripterzeugung für Lernvideos verbraucht keine Lovable-Credits mehr, sondern läuft direkt über deinen Google-Gemini-Schlüssel.

## Ausgangslage (geprüft)

- Fast alle KI-Funktionen laufen bereits direkt über Gemini mit `GEMINI_API_KEY` (`_shared/gemini.ts`): Framing-Vorschläge, Sprint-Vorschläge, Sprint-Rangfolge, Tageszusammenfassungen, BMAD.
- Der KI-Berater im Modellkatalog läuft über Kie.ai.
- Einzige Ausnahme: `whiteboard-script` (Skripterzeugung im Lernvideo-Editor) ruft noch das Lovable-Gateway auf – das ist die Stelle, die Lovable-Credits verbraucht.
- Der Voice-Bot läuft über deinen n8n-Haken, nicht über Lovable KI.
- Die E-Mail-Funktionen nutzen den Lovable-Schlüssel nur für den verwalteten E-Mail-Versand, nicht für KI. Sie bleiben unverändert, sonst fallen die Anmelde-Mails aus.

## Umsetzung

1. `supabase/functions/whiteboard-script/index.ts`:
   - Aufruf des Lovable-Gateways ersetzen durch den vorhandenen Helfer `callGemini` aus `_shared/gemini.ts`.
   - Modell: `gemini-2.5-flash` (dasselbe wie bei den übrigen Funktionen).
   - Prompt, JSON-Auswertung, deutsche Fehlertexte, Wiederholungen bei Auslastung und die Admin-Prüfung bleiben unverändert.
   - Verständliche Fehlermeldung, falls der Gemini-Schlüssel fehlt.
2. Funktion neu ausrollen und mit einem Testaufruf prüfen, ob ein Skript zurückkommt.
3. Rückmeldung im Editor bleibt wie heute – keine Oberflächen-Änderung nötig.

## Voraussetzung

Der Schlüssel `GEMINI_API_KEY` ist bereits hinterlegt (Sprint- und Framing-Funktionen nutzen ihn). Falls er beim Test fehlt oder abgelehnt wird, melde ich es und du hinterlegst ihn einmal sicher über das Schlüssel-Formular.

## Nicht geändert

E-Mail-Versand, Voice-Bot, Kie.ai-Bilder/-Stimmen/-Videoclips, der Modellkatalog, alle Oberflächen.
