## Ziel

Im **Solo-Modus** bekommt jede Vorschlagsliste (Standard-Variante „checkbox-list") einen zusätzlichen KI-Button **„Ranking & Marktrecherche"**. Gemini liefert:
1. Eine kurze **Marktrecherche** zum Thema (2–4 Sätze) über **Google-Suche-Grounding** mit Quellenlinks.
2. Ein **Ranking** der bestehenden Vorschläge (1 = beste) inkl. Kurzbegründung.
3. Die **Top 3** werden automatisch vorausgewählt.

## Backend: neue Edge Function `sprint-ai-rank`

`supabase/functions/sprint-ai-rank/index.ts`

- Auth wie bestehend (`sprint-ai-suggest`): Bearer-Token, RLS-Check über Sprint-Read.
- Body (Zod):
  - `sprint_id` (uuid), `step_key`, `step_frage`, `step_arbeit`
  - `options: string[]` (Vorschläge + Eigene, mind. 2)
  - `context` (frühere Schritte als Hintergrund)
- Gemini-Call: Modell `gemini-2.5-flash` direkt über `GEMINI_API_KEY` (wie bestehend).
- Aktiviert **Google-Suche-Grounding** über `tools: [{ google_search: {} }]`.
- System-Prompt: Ranking + Marktrecherche-Auftrag, JSON-Output erzwingen.
- Response-Schema:
  ```json
  {
    "marktrecherche": "2-4 Sätze deutscher Fließtext",
    "quellen": [{"title": "...", "uri": "https://..."}],
    "ranking": [{"option": "exakter Vorschlag", "rang": 1, "begruendung": "1 Satz"}]
  }
  ```
- `quellen` werden aus `groundingMetadata.groundingChunks[].web` extrahiert (kommt automatisch von der Search-Tool-Antwort).
- Fehlerbehandlung & CORS analog zur Suggest-Function.

## Frontend: `src/components/sprint/SprintStepCard.tsx`

Direkt unter der KI-Vorschläge-Liste (nur wenn `isSolo && step.variant !== "notes"` und mindestens 2 Optionen vorhanden):

- Neuer Button **„KI-Ranking & Marktrecherche"** neben/unter „Mehr Vorschläge".
- Lokaler State: `rankResult` (`{ marktrecherche, quellen, rankingMap: Record<option, {rang, begruendung}> }`), `rankLoading`.
- On click:
  1. `supabase.functions.invoke("sprint-ai-rank", { body: { sprint_id, step_key, step_frage, step_arbeit, context, options: allOptions } })`
  2. Bei Erfolg: Ergebnis in State legen + **Top 3 in `auswahl` setzen** (per `setAuswahl(top3)` — überschreibt bestehende Auswahl, mit Toast-Hinweis "Top 3 vorausgewählt — du kannst manuell anpassen").
- Anzeige:
  - **Marktrecherche-Card** (kleine Box mit `bg-muted/40`, Sparkles-Icon, Markdown-Text + Quellenliste als externe Links `target="_blank" rel="noopener"`).
  - Pro Vorschlag in der Checkbox-Liste: Wenn Rang vorhanden, kleines Rang-Badge (z. B. „#1") + Tooltip/Caption mit Begründung.
  - Optional: Die Liste wird nach Rang sortiert dargestellt (nur Anzeige-Reihenfolge, State bleibt).
- Persistenz: `rankResult` wird im `data`-JSON als `aiRank` mitgespeichert, damit es nach Reload erhalten bleibt (Erweiterung von `SprintStepData`).

## Typ-Erweiterung

`src/features/sprint/types.ts`: Optional `aiRank` zu `SprintStepData` hinzufügen:
```ts
aiRank?: {
  marktrecherche: string;
  quellen: { title: string; uri: string }[];
  ranking: { option: string; rang: number; begruendung: string }[];
};
```
Wird in `persist()` mit übergeben (kompatibel zu allen bestehenden Speicher-Pfaden).

## Sichtbarkeit

- Nur **Solo-Modus**.
- Nur Standard-Variante (`step.variant` undefined oder explizit „checkbox-list" — d. h. dort, wo `allOptions` als Checkbox-Liste angezeigt wird).
- Nicht in `notes`, `map`, `flow-3-steps`, `crazy8s`, `sketches` etc.

## Hinweise

- Google-Search-Grounding ist bei `gemini-2.5-flash` über die `tools`-Property aktiv; `responseSchema` und `tools` zusammen sind unterstützt.
- Top 3 ersetzt bestehende Auswahl bewusst (User-Wunsch). Toast informiert.
- Keine DB-Migration nötig — Daten liegen in `sprint_steps.data` (JSONB).
