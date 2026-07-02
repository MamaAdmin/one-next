## Problem

Im Abschluss-Panel bleiben die Häkchen für „Scope klar" (Schritt 8) und „Messziel definiert" (Schritt 7) grau, obwohl die Punkte gefüllt sind.

Ursache: `FramingCompletionPanel.tsx` prüft nur die **eigenen** Felder:
- `step7.erfolgsmessung` (Textarea „Eigene Anmerkungen")
- `step8.inScope` / `step8.outOfScope` (Listen „Eigene Anmerkungen")

Alle über die KI-Vorschläge akzeptierten Einträge landen aber in separaten Arrays (`kiErfolgsmessung`, `kiInScope`, `kiOutOfScope`) und werden ignoriert. Wer nur KI-Vorschläge übernimmt, kann den Sprint nicht abschließen.

## Fix

In `src/components/framing/FramingCompletionPanel.tsx`:

1. Typ-Erweiterung der lokalen Step-Payloads:
   - `step7`: zusätzlich `kiErfolgsmessung?: string[]`
   - `step8`: zusätzlich `kiInScope?: string[]`, `kiOutOfScope?: string[]`
2. DoD-Bedingungen anpassen:
   - `measureOk = (step7?.erfolgsmessung?.trim()?.length ?? 0) > 0 || (step7?.kiErfolgsmessung?.length ?? 0) > 0`
   - `scopeOk = ((step8?.inScope?.length ?? 0) + (step8?.kiInScope?.length ?? 0)) >= 1 && ((step8?.outOfScope?.length ?? 0) + (step8?.kiOutOfScope?.length ?? 0)) >= 1`
3. Label leicht präzisieren: „Scope klar (In/Out je ≥1 Punkt – eigene oder KI)".

Keine weiteren Änderungen (kein Backend, keine Migration).