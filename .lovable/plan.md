## Ziel
Klare Trennung zwischen Eigenem und KI. Der Text der KI wandert nie ins User-Feld, sondern in eine getrennte KI-Liste unter dem User-Feld.

## Datenmodell (`src/features/framing/types.ts`)

Zusätzliche Arrays für persistente KI-Übernahmen im Two-Fields-Schritt:
- `kiWarumJetzt?: string[]`
- `kiDefaultFuture?: string[]`
- `kiWettbewerber?: string[]`
- `kiTrends?: string[]`
- `kiChancen?: string[]`

`warumJetzt` und `defaultFuture` bleiben unverändert (User-Text bzw. User-Liste).

## UI in `src/components/framing/FramingStepCard.tsx` – Two-Fields-Schritt

Pro Bucket (Gegenwart, Zukunft, Wettbewerb, Trends, Chancen) drei klar getrennte Bereiche in dieser Reihenfolge:

1. **Eigene Anmerkungen** – bestehendes Textarea bzw. ListEditor, Label auf „Eigene Anmerkungen" vereinheitlicht.
2. **Übernommene KI-Vorschläge** – neue Liste im Accent-Look (`border-accent/60 bg-accent-soft text-accent-foreground`) mit X-Button zum Entfernen. Nur sichtbar, wenn Items vorhanden. Zeigt Inhalte aus dem passenden `ki*`-Array.
3. **KI-Vorschläge** – bestehender Bereich mit KI-Button + Kartenliste. „Übernehmen" pusht den Text in das passende `ki*`-Array (statt in `warumJetzt`/`wettbewerber`/…) und entfernt die Karte aus dem Vorschlagsstack.

Vergangenheit bleibt ohne KI wie bisher.

## `applySuggestion` (two-fields)

Statt in User-Felder zu schreiben, nach Bucket in das jeweilige `ki*`-Array pushen. `pushUnique` bleibt bestehen. Keine Änderung an anderen Varianten.

## Nicht Teil dieser Änderung

- Backend / Edge-Function unverändert.
- Andere Schritte (`context-list`, `stakeholder`, `sailboat`, `five-whys`, `cynefin`, `assumptions`, `success-constraints`, `scope-questions`, `nuf`, `next-steps`) bleiben unverändert.
- Challenge-Statement-Generator liest die neuen `ki*`-Felder nicht automatisch – falls die KI-Punkte dort einfließen sollen, klären wir das in einem eigenen Schritt.