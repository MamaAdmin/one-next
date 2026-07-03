## End-to-End-Fluss Framing → Sprint: 2 Fixes

### Was ich geprüft habe
- Alle 11 realen Framing-Schritte (`1`, `2`, `3`, `4`, `5`, `5b`, `6`, `7`, `8`, `9`, `10`) speichern konsistent in `framing_steps`.
- `framing-generate-challenge` liest Session + alle `framing_steps` → an Gemini → liefert `titel`, `challenge_statement`, `zielgruppe`, `erfolgsmessung`, `sprintFragen`, `risiken`.
- `FramingCompletionPanel.handleFinish` erzeugt Sprint mit `challenge_statement`, `zielgruppe`, `erfolgsmessung`, `sprint_fragen`. **`risiken` fehlt.**

### Gefundene Lücken

**1. `risiken` gehen beim Sprint-Anlegen verloren** – Fix: in Sprint übernehmen (deine Wahl).

**2. Kontext-Sortierung ist lexikographisch** in beiden Edge-Functions (`framing-generate-challenge`, `framing-ai-suggest`):
```
1, 10, 2, 3, 4, 5, 5b, 6, 7, 8, 9  (Schritt 10 direkt hinter 1)
```
Alle Daten kommen an, aber die logische Kette im Prompt ist gebrochen.

### Umsetzung

**Schema-Migration** (`sprints`-Tabelle):
```sql
ALTER TABLE public.sprints
  ADD COLUMN risiken jsonb NOT NULL DEFAULT '[]'::jsonb;
```
Keine neuen RLS/Grants nötig (bestehende Policies decken die Spalte ab).

**`src/hooks/useSprint.tsx`**
- `CreateSprintInput`: `risiken?: string[]` ergänzen.
- `SprintRow` / `SprintExtraRow`: `risiken: string[]` (bzw. wo `sprint_fragen` bereits typisiert ist).

**`src/components/framing/FramingCompletionPanel.tsx`**
- `handleFinish`: `risiken: result.risiken` an `createSprint.mutateAsync` weitergeben.
- UI: kompakte Liste „Identifizierte Risiken" oberhalb der Definition of Done, editierbar analog zu Sprint-Fragen (add/remove/edit), damit die User sie vor Sprint-Start prüfen können.

**`supabase/functions/framing-generate-challenge/index.ts`** und **`supabase/functions/framing-ai-suggest/index.ts`**
- `buildContext`: Sortierung nach fester Index-Map ersetzen:
```ts
const ORDER: Record<string, number> = {
  "1":1,"2":2,"3":3,"4":4,"5":5,"5b":6,"6":7,"7":8,"8":9,"9":10,"10":11,
};
const sorted = [...steps].sort(
  (a, b) => (ORDER[a.step_key] ?? 99) - (ORDER[b.step_key] ?? 99)
);
```

**Anzeige im Sprint** (optional, aber sinnvoll): falls es bereits einen Ort gibt, an dem `challenge_statement`/`zielgruppe`/`erfolgsmessung` im Sprint-Workspace angezeigt werden, `risiken` dort ebenfalls einblenden. Wenn nicht vorhanden, überspringen — Daten sind dann zumindest persistiert und via Admin-Detailseite lesbar.

### Nicht verändert
- `framing_sessions.challenge_statement` bleibt Text-Feld (nur `challenge_statement`-String), Rest liegt am Sprint.
- Kein Datenverlust bei bereits abgeschlossenen Framings: neue Spalte hat Default `[]`, alte Sprints bekommen leere Risikoliste.
