## Ziel

Die KI-Marktrecherche & Ranking-Voreinstellung soll sich strikt am `stimmenLimit` des jeweiligen Schritts orientieren – also genauso viele Top-Optionen vorauswählen, wie Stimmen pro Person erlaubt sind. Der Team-Modus (Multiplikation Stimmen × Teilnehmer) folgt in einer späteren Etappe und ist hier nicht Teil des Scopes.

## Änderungen in `src/components/sprint/SprintStepCard.tsx`

1. **Top-N am `stimmenLimit` ausrichten (statt am bisherigen Min(limit, 3))**
   In `handleRank` aktuell:
   ```ts
   .slice(0, Math.min(limit ?? 3, 3))
   ```
   Neu:
   ```ts
   const topN = step.stimmenLimit ?? 3;
   …
   .slice(0, topN)
   ```
   - Bei `stimmenLimit = 1` → Top 1
   - Bei `stimmenLimit = 2` → Top 2
   - Bei `stimmenLimit = 5` (z. B. 1.4 HMW, 5.3 Hot Takes) → Top 5
   - Fallback `3`, falls ein Schritt kein Limit definiert hat.

2. **Toast-Text dynamisch**
   `"Top N wurde vorausgewählt"` nutzt denselben `topN`-Wert.

3. **Button-Label anpassen**
   Statt `Top {Math.min(limit ?? 3, 3)}`:
   ```tsx
   Top {step.stimmenLimit ?? 3}
   ```
   So sieht der User vor dem Klick, wie viele Optionen markiert werden.

4. **Hinweis für späteren Team-Modus**
   Kein Code – nur als Kommentar im Code festhalten:
   ```ts
   // TODO Team-Modus: effektives Limit = stimmenLimit * Teilnehmer
   ```
   damit die spätere Etappe die Stelle leicht findet.

## Keine sonstigen Änderungen

- `stimmenLimit` in `src/features/sprint/steps.ts` bleibt unverändert (Single Source of Truth).
- Die Checkbox-Sperre (`limitReached`) und der Zähler `{auswahl.length} / {limit} Stimmen` bleiben unverändert – sie nutzen bereits `step.stimmenLimit`.
- Edge Function `sprint-ai-rank` unverändert (liefert weiterhin ein vollständiges Ranking; das Frontend entscheidet, wie viele Top-Einträge vorausgewählt werden).
