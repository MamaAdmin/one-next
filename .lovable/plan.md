## Umstellung: KI-Kosten über Gemini API statt Lovable Gateway

Ziel: Alle KI-Aufrufe laufen direkt gegen `generativelanguage.googleapis.com` mit `GEMINI_API_KEY`. Kosten erscheinen im Google-Cloud-Dashboard, keine Lovable Credits mehr für KI. `GEMINI_API_KEY` ist bereits als Secret vorhanden.

## Betroffene Edge Functions

Bereits direkt (unverändert):
- `sprint-ai-suggest`
- `sprint-ai-rank`

Umzustellen (aktuell Lovable Gateway → Gemini direkt):
- `framing-ai-suggest` — Model `google/gemini-3-flash-preview` → `gemini-2.5-flash`
- `framing-generate-challenge` — Model `google/gemini-3-flash-preview` → `gemini-2.5-flash`
- `sprint-day-summary` — Model `google/gemini-2.5-flash` → `gemini-2.5-flash`
- `bmad-run-phase` — Model konfigurierbar (`google/gemini-2.5-flash`/`pro`, teils `openai/gpt-5*`) → nur Gemini-Varianten mappen; OpenAI-Optionen aus der UI entfernen

Nicht betroffen (kein KI-Aufruf, `LOVABLE_API_KEY` wird dort für Resend/Connector genutzt):
- `process-email-queue`
- `auth-email-hook`

## Technische Änderungen pro Function

1. Statt `POST https://ai.gateway.lovable.dev/v1/chat/completions` mit Header `Authorization: Bearer LOVABLE_API_KEY` und OpenAI-kompatiblem Body:
   ```
   POST https://generativelanguage.googleapis.com/v1beta/models/<MODEL>:generateContent?key=<GEMINI_API_KEY>
   Body: { contents: [{ role, parts: [{ text }] }], systemInstruction?, generationConfig: { temperature, maxOutputTokens: 8192, responseMimeType?: "application/json" } }
   ```
2. Response-Parsing: `data.candidates[0].content.parts[0].text` (statt `data.choices[0].message.content`). `finishReason === "MAX_TOKENS"` behandeln (siehe Lovable-Stack-Overflow-Hinweis, `maxOutputTokens: 8192`).
3. Strukturierte Ausgaben (`response_format: json_object`, Tool-Calls in `framing-ai-suggest`): auf Gemini umstellen mit `generationConfig.responseMimeType = "application/json"` + `responseSchema`, oder Tool-Calls über `tools: [{ functionDeclarations: [...] }]`. Für die aktuellen Use-Cases reicht `responseMimeType: application/json` + Schema im Prompt.
4. Rollen-Mapping: OpenAI `system` → Gemini `systemInstruction`; `assistant` → `model`; `user` → `user`.
5. Fehlerbehandlung: 429 (Quota) und 400 (Safety/Block) klar an die UI zurückgeben; Message- und Statuscodes unverändert lassen, damit Aufrufer weiter funktionieren.
6. `LOVABLE_API_KEY`-Nutzung in diesen 4 Functions entfernen (in `process-email-queue`/`auth-email-hook` bleibt sie erhalten).
7. Model-Auswahl in `src/pages/admin/BMADSessionDetail.tsx` und `bmad-create-session` auf reine Gemini-Werte reduzieren (`gemini-2.5-flash`, `gemini-2.5-pro`), OpenAI-Einträge entfernen. Default bleibt `gemini-2.5-flash`.

## Vorgehen

1. Gemeinsamen Helper `supabase/functions/_shared/gemini.ts` anlegen (`callGemini({ model, systemInstruction, messages, json?, schema? })` inkl. Debug-Log für `finishReason` + `MAX_TOKENS`-Warnung).
2. `framing-ai-suggest`, `framing-generate-challenge`, `sprint-day-summary`, `bmad-run-phase` auf diesen Helper umstellen.
3. UI-Model-Auswahl (`BMADSessionDetail.tsx`, `bmad-create-session`) bereinigen.
4. Nach Deployment: je einen Test-Aufruf pro Function und `edge_function_logs` prüfen; danach `ai_gateway_logs--list_ai_gateway_requests` prüfen — es sollten keine neuen KI-Calls mehr erscheinen.

## Hinweise / Trade-offs

- **Kosten sichtbar in Google Cloud**, aber Rate-Limits & Quota-Management liegen jetzt beim Google-Projekt (`Preisstufe 1` reicht für die aktuelle Nutzung). Falls Quotas erreicht werden, muss der Tier in Google Cloud erhöht werden.
- **Kein automatisches Fallback** mehr auf andere Provider (der Lovable Gateway erlaubte OpenAI-Modelle). BMAD verliert die GPT-5-Optionen — bestätige, ob das ok ist oder ob GPT-5 als Option bleiben soll (dann müsste dort weiter der Gateway laufen).
- Modell `gemini-3-flash-preview` existiert nur über den Lovable Gateway. Direkter Gemini-Aufruf nutzt `gemini-2.5-flash` (Google-nativer Name). Falls du explizit `gemini-3` willst, muss der Preview-Zugang in Google AI Studio verfügbar sein — sonst bei `2.5-flash` bleiben.
- `GEMINI_API_KEY` ist bereits als Secret vorhanden — keine neue Secret-Anfrage nötig.

Bestätige bitte:
(a) Sollen die OpenAI-Optionen in BMAD wirklich entfernt werden, oder für BMAD weiter Lovable Gateway behalten?
(b) `gemini-2.5-flash` als Default ok (statt `gemini-3-flash-preview`)?