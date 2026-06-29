
## Ziel

Das Slide-Original zeigt pro Person mehrere kurze Antworten (3 Sticky-Notes je Spalte). Aktuell hat unsere "Deine Antwort"-Box nur ein einzelnes Textarea. Wir bauen sie zu einer **Multi-Antwort-Komponente** um, damit der/die User wie im Original mehrere Antwort-Sticky-Notes erfassen kann. Bestehende shadcn-Komponenten werden wiederverwendet.

## Änderungen

### 1. `src/features/sprint/types.ts`
- Feld `antwort?: string` → `antworten?: string[]`
- (Migration im Code: beim Laden alte `antwort` automatisch in `antworten: [antwort]` konvertieren, kein DB-Eingriff nötig, da `data` JSONB ist.)

### 2. `src/components/sprint/SprintStepCard.tsx`
Die "Deine Antwort"-Box komplett ersetzen durch eine Sticky-Note-Liste:

- State: `const [antworten, setAntworten] = useState<string[]>(...)` mit Migration aus altem `antwort`-String.
- Lokales Eingabefeld `antwortInput` + Button "Antwort hinzufügen".
- Darstellung der gesetzten Antworten als Karten/Sticky-Notes (Card + Badge "Nr.", kleiner X-Button zum Entfernen, Edit per Klick optional über `Textarea`).
- Wiederverwendete Komponenten: `Card`, `CardContent`, `Textarea`, `Input`, `Button`, `Badge`, Icon `Plus`, `X` (lucide).
- Styling lehnt sich an Sticky-Note-Look an (abgerundet, dezent farbiger Hintergrund via Design-Tokens `bg-primary/5`, `border-primary/20`), kein Hardcoding von Farben.
- `onSave` schreibt `antworten` statt `antwort`.
- AI-Kontext: `ctx["eigene_antworten_in_diesem_schritt"] = antworten` (statt String).
- `buildContextEntries` / `formatContextValue` behandeln `antworten: string[]` (Liste rendern).

### 3. `supabase/functions/sprint-ai-suggest/index.ts`
- Prompt-Hinweis kosmetisch anpassen: aus "die eigene Antwort des Users" → "die eigenen Antworten des Users (Liste)". Logik bleibt, da `context` generisch übergeben wird.

## Nicht-Ziele

- Keine Änderung am DB-Schema (JSONB akzeptiert beide Formen, Migration läuft client-seitig beim Laden).
- Keine Änderung an Voting/Auswahl-Logik (Solo vs. Team bleibt wie zuletzt vereinbart).
- Keine neuen Abhängigkeiten.
