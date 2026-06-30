# Sticky-Notes auf Projekt-Palette umstellen

## Ziel
Die beiden Sticky-Note-Optiken im Sprint-Flow nutzen aktuell Schwarz/Weiß bzw. ein hartes Gelb. Sie sollen stattdessen warme Töne aus der bestehenden Design-Token-Palette verwenden — kein Schwarz.

## Verfügbare Tokens (aus `src/index.css`)
- `--accent` (zartes Rosé, `350 60% 85%`)
- `--accent-soft` (sehr helles Rosa, `9 100% 96%`)
- `--secondary` (warmes Beige, `40 25% 85%`)
- `--muted` (helles Beige, `40 25% 90%`)
- `--background` (warmes Off-White)

## Änderungen in `src/components/sprint/SprintStepCard.tsx`

### 1. „Deine Antworten"-Block (Zeilen ~306–366)
- Container (`border-2 border-primary/20 bg-primary/5`) → `border-accent/40 bg-accent-soft`.
- Einzelne Notiz-Karten (`border border-primary/30 bg-background`) → `border-accent/50 bg-accent/30`, zarter Schatten beibehalten, leichte Rotation/Hover optional weglassen (nur Farbe ändern).
- Badge/Buttons unverändert (nutzen bereits Tokens).

### 2. MapBoard Lane-Notizen (Zeile ~716)
- `border-yellow-300/60 bg-yellow-100/70 dark:bg-yellow-200/20` → `border-accent/50 bg-accent/40`.
- Dark-Mode-Variante über Token automatisch korrekt.

### 3. MapBoard-Container (Zeile ~642)
- `border-primary/20 bg-muted/20` bleibt (nutzt Tokens), keine Änderung nötig.

## Nicht im Scope
- Keine Layout- oder Funktionsänderungen.
- Keine neuen Tokens; nur bestehende verwenden.
- Andere Schritte/Komponenten bleiben unverändert.