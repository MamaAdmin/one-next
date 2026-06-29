# Plan: Vorschläge mit Gemini 3 Flash über Lovable AI Gateway

## Ziel
Die Edge Function `sprint-ai-suggest` ruft bereits das Lovable AI Gateway auf, aktuell mit `google/gemini-2.5-flash`. Umstellung auf **`google/gemini-3-flash-preview`** (der von Lovable empfohlene Default für Chat/Text). Die API ist über `LOVABLE_API_KEY` schon angebunden — kein neuer Secret nötig.

## Scope (eng begrenzt)
Genau **eine Zeile** in **einer Datei**:

- `supabase/functions/sprint-ai-suggest/index.ts`
  - `model: "google/gemini-2.5-flash"` → `model: "google/gemini-3-flash-preview"`

Sonst nichts: Request-Shape (OpenAI-kompatibel über `ai.gateway.lovable.dev/v1/chat/completions`), Auth, RLS-Check, Response-Parsing zu `{ vorschlaege: string[] }`, Zod-Validierung und Client (`SprintStepCard.tsx`) bleiben unverändert.

## Nicht im Scope
- Kein Wechsel zur Anthropic API / Claude
- Keine Modell-Auswahl im UI
- Keine neuen Secrets (`LOVABLE_API_KEY` ist gesetzt)
- Keine Änderung an DB, Typen, anderen Edge Functions

## Verifikation
1. Edge Function neu deployen (`sprint-ai-suggest`)
2. In `/sprint/:id` einen Schritt öffnen, „Vorschläge generieren" klicken
3. Edge-Function-Logs prüfen: 200 vom Gateway, `model: google/gemini-3-flash-preview`
4. Vorschläge erscheinen in der Liste

Soll ich das so umsetzen?
