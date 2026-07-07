## Teil 1 — Cynefin-Reste aufräumen

### `src/features/framing/types.ts`
- `export type Cynefin = …` entfernen.
- `ursachen?: Array<{ text: string; cynefin: Cynefin; adressierbar: boolean }>` → `ursachen?: Array<{ text: string; adressierbar: boolean }>`.

### `src/components/framing/FramingStepCard.tsx`
- `Cynefin`-Import aus `../../features/framing/types` entfernen.
- Gesamte Funktion `VariantCynefin` inklusive Sub-Helper (Drag/Drop-Handler, Quadranten-JSX, Cynefin-Erklärungs-Section) löschen — ca. Z. 1524–1790.
- `CynefinBucket` aus der `SuggestionBucket`-Union entfernen (Z. 837, 843) und alle damit toten Zweige mitentfernen.
- In `VariantFiveWhys` beim Push neuer Ursachen (Z. 1412) das Default-Feld `cynefin: "kompliziert"` weglassen.
- Hinweis-Copy „Nur Ursachen sammeln – die Cynefin-Einordnung erfolgt automatisch im nächsten Schritt." (Z. 1437) ersetzen durch: „Ursachen als kurze Stichpunkte erfassen."

### `src/features/framing/steps.ts`
- Veralteten `5b`-Kommentar (Z. 29) entfernen.

### Datenbank
- Keine Migration. Alte JSONB-Einträge mit `cynefin` bleiben unangetastet, werden nirgends mehr gelesen.

## Teil 2 — Sprint-Fragen als Kontext einbinden

### `src/features/sprint/steps.ts`
`nutztDatenAus` erweitern um `"sprint.sprint_fragen"` bei:
- Schritt **1.1 Ziel** → `["sprint.titel", "sprint.problemstellung", "sprint.sprint_fragen"]`
- Schritt **1.4 HMW** → `["1.1", "1.2", "1.3", "sprint.sprint_fragen"]`
- Schritt **5.1 Scorecard** → `["3.2", "1.3", "1.8", "1.11", "1.10", "sprint.sprint_fragen"]`

Alle anderen Schritte unverändert.

### `src/components/sprint/SprintStepCard.tsx`
In `buildContextEntries` (Z. 861 ff.) einen neuen Zweig ergänzen, analog zu `sprint.titel` / `sprint.problemstellung`:

```ts
if (ref === "sprint.sprint_fragen") {
  entries.push({
    key: ref,
    label: "Sprint-Fragen (aus Framing)",
    value: (sprint.sprint_fragen ?? []).length > 0
      ? sprint.sprint_fragen
      : "(keine übernommen)",
  });
  continue;
}
```

Damit erscheinen die Sprint-Fragen automatisch im „Nutzt Daten aus früheren Schritten"-Panel und fließen über den bestehenden `ctx`-Payload in `sprint-ai-suggest`/`sprint-ai-rank` ein — keine Edge-Function-Änderung nötig.

## Verifikation

- `bunx tsgo --noEmit` grün.
- Framing-Workshop: Schritt 5 (Root Cause) → Ursache hinzufügen → weiter zu Schritt 6, keine Console-Errors.
- Sprint-Workspace: In Schritten 1.1, 1.4 und 5.1 erscheint der Kontext-Eintrag „Sprint-Fragen (aus Framing)"; KI-Vorschläge in 1.4 greifen sie sichtbar auf.

## Technische Details

- `sprint.sprint_fragen` ist bereits in `SprintRow` (`src/hooks/useSprint.tsx`, `src/features/sprint/types.ts`) als `string[]` vorhanden — kein Typ-Erweiterungsaufwand.
- Der `VariantCynefin`-Block ist groß (~270 Zeilen); in einem Rutsch entfernen, damit `noUnusedLocals` nicht wegen dangling Imports/Helpers anschlägt.
