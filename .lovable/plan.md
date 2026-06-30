## Ziel

Die ursprünglichen Stimmen-Limits aus der Sprint-Definition (`stimmenLimit`) sollen auch im **Solo-Modus** gelten — z. B. bei Schritt 2.5 (Skizzen-Crit) nur 2 Stimmen, bei 2.7 nur 1 Stimme usw. Zusätzlich wird die **maximale Stimmenanzahl** sichtbar in den Anweisungsblock aufgenommen.

## Änderungen in `src/components/sprint/SprintStepCard.tsx`

1. **Limit auch im Solo-Modus aktivieren**
   - Heute:
     ```ts
     const limit = isSolo ? undefined : step.stimmenLimit;
     ```
   - Neu:
     ```ts
     const limit = step.stimmenLimit;
     ```
   Damit greift `limitReached` und das Deaktivieren weiterer Checkboxen sowohl im Solo- als auch im Team-Modus.

2. **Top-3-Voreinstellung respektiert das Limit**
   In `handleRank` werden aktuell hart die Top 3 gesetzt:
   ```ts
   .slice(0, 3)
   ```
   Wird ersetzt durch:
   ```ts
   .slice(0, Math.min(limit ?? 3, 3))
   ```
   So werden bei `stimmenLimit = 1` nur Top 1, bei `stimmenLimit = 2` nur Top 2 vorausgewählt. Toast-Text wird entsprechend dynamisch („Top N vorausgewählt").

3. **Stimmen-Anzahl in der Anweisungs-Box anzeigen**
   Im Block „Allein arbeiten / Zusammen arbeiten" wird unter `arbeit` eine zusätzliche Zeile gerendert, wenn `step.stimmenLimit` gesetzt ist:
   ```
   Max. Stimmen: {step.stimmenLimit} {step.stimmenLimit === 1 ? "Stimme" : "Stimmen"}
   ```
   Bisher wurde diese Info nur über `step.abstimmung` ausgegeben — und das nur im Team-Modus. Neue Anzeige läuft modus-unabhängig.

4. **Zähler-Anzeige im Header**
   Der bestehende Zähler `{auswahl.length} / {limit} Stimmen` greift dann automatisch auch im Solo-Modus, da `limit` jetzt gesetzt ist. Der Solo-Fallback `{auswahl.length} ausgewählt` bleibt nur, wenn der Schritt **kein** `stimmenLimit` definiert hat (z. B. Notizen/Map).

## Keine sonstigen Änderungen

- `src/features/sprint/steps.ts` bleibt unangetastet — die `stimmenLimit`-Werte sind bereits korrekt definiert.
- Keine DB-Migration nötig.
- Edge Functions unverändert.