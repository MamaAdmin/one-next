# Plan: Vorschläge direkt über Google Gemini API (eigener Key, Google-Abrechnung)

## Ziel
Die Edge Function `sprint-ai-suggest` soll Gemini nicht mehr über das Lovable AI Gateway (Credit-Abrechnung) aufrufen, sondern **direkt gegen die Google Generative Language API** mit einem eigenen `GEMINI_API_KEY`. Damit läuft die Abrechnung über Google (AI-Studio-Tier bzw. das verknüpfte GCP-Billing-Projekt) statt über Lovable Credits.

## Voraussetzung (User-Aktion)
Der User legt im Google AI Studio einen API-Key an und speichert ihn als Secret `GEMINI_API_KEY`. Ich fordere ihn nach Plan-Bestätigung via `add_secret` an — vorher nicht.

## Änderungen (eine Datei)

`supabase/functions/sprint-ai-suggest/index.ts`

1. **Secret-Wechsel**
   - `LOVABLE_API_KEY` entfernen.
   - Neu: `GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")`. Wenn fehlt → 500 mit klarer Fehlermeldung.

2. **Endpoint & Request-Shape (nativ Gemini, nicht OpenAI-kompatibel)**
   - URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
   - Modell: `gemini-2.5-flash` (Standard für AI Studio; Gemini-3-Preview-IDs sind dort noch nicht öffentlich verfügbar — wenn du eine andere Modell-ID willst, sag Bescheid).
   - Body:
     ```json
     {
       "systemInstruction": { "parts": [{ "text": "<systemPrompt>" }] },
       "contents": [{ "role": "user", "parts": [{ "text": "<userPrompt>" }] }],
       "generationConfig": {
         "responseMimeType": "application/json",
         "responseSchema": {
           "type": "object",
           "properties": {
             "vorschlaege": { "type": "array", "items": { "type": "string" } }
           },
           "required": ["vorschlaege"]
         },
         "temperature": 0.8
       }
     }
     ```
   - System-Prompt und HMW-Sonderregel (Schritt 1.4 → „Wie können wir …?") bleiben unverändert.

3. **Response-Parsing**
   - JSON-Text aus `data.candidates[0].content.parts[0].text` ziehen, `JSON.parse`, `vorschlaege: string[]` extrahieren.
   - HMW-Normalisierung (Präfix/Fragezeichen) bleibt wie aktuell.

4. **Fehler-Mapping**
   - 401/403 von Google → 502 mit Hinweis „Gemini API key invalid or lacks permissions".
   - 429 → 429 weiterreichen.
   - Sonst → 500 mit redigierter Fehlermeldung.

5. **Client/RLS unverändert**
   - Auth-Check, Sprint-Lesetest, Zod-Validierung, Antwortformat `{ vorschlaege: string[] }` bleiben identisch.
   - `SprintStepCard.tsx` wird nicht angefasst.

## Verifikation
1. Nach Speichern von `GEMINI_API_KEY` Edge Function deployen.
2. In `/sprint/:id` einen Schritt öffnen → „Vorschläge generieren".
3. Edge-Function-Logs prüfen: 200 von `generativelanguage.googleapis.com`, Vorschläge erscheinen.
4. Schritt **1.4 (HMW)** testen: Alle Vorschläge beginnen mit „Wie können wir " und enden mit „?".
5. Lovable Credits prüfen: keine neuen AI-Gateway-Calls mehr in den Gateway-Logs.

## Nicht im Scope
- Kein Modell-Picker im UI.
- Keine Migration anderer Edge Functions (nur `sprint-ai-suggest`).
- Kein Wechsel zurück zu Anthropic.

**Frage vor Umsetzung:** Modell `gemini-2.5-flash` (stabil, AI Studio, günstig) okay — oder willst du explizit `gemini-2.5-pro` (teurer, stärker)?
