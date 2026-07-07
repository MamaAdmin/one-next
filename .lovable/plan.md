## Befund

- `src/features/framing/steps.ts`: **kein** `5b`-Step mehr, nur noch ein veralteter Kommentar in Zeile 29.
- Rest ist toter Code / Datenmüll:
  - `src/features/framing/types.ts`: `Cynefin` Typ + `cynefin`-Feld auf `ursachen[]`.
  - `src/components/framing/FramingStepCard.tsx`: kompletter `VariantCynefin`-Block (~Z. 1524–1790), `CynefinBucket` Typ, `Cynefin` Import, Copy „Cynefin-Einordnung erfolgt automatisch im nächsten Schritt" (Z. 1437), Default-Wert `cynefin: "kompliziert"` beim Anlegen neuer Ursachen (Z. 1412).
  - `supabase/functions/framing-ai-suggest/index.ts` und `framing-generate-challenge/index.ts`: bereits bereinigt.

Also brauchst du einen **Aufräum-Prompt** (Datenmodell + Komponente + Typen), keinen bloßen Lösch-Prompt.

## Plan: Cynefin-Reste aufräumen

### 1. Typen (`src/features/framing/types.ts`)
- `export type Cynefin = …` entfernen.
- `ursachen?: Array<{ text: string; cynefin: Cynefin; adressierbar: boolean }>` → `ursachen?: Array<{ text: string; adressierbar: boolean }>`.

### 2. Komponente (`src/components/framing/FramingStepCard.tsx`)
- `Cynefin`-Import aus `../../features/framing/types` entfernen.
- Gesamte Funktion `VariantCynefin` (inkl. Sub-Helpers `inline`, `flashSnap`, `handleDropInQuadrant`, Quadranten-JSX, Cynefin-Erklärungs-`CanvasSection`) entfernen — ca. Z. 1524–1790.
- `CynefinBucket` aus `SuggestionBucket`-Union entfernen (Z. 837, 843).
- In `VariantFiveWhys` (Z. 1412) `cynefin: "kompliziert"` beim Push neuer Ursachen weglassen.
- Hinweis-Copy „Nur Ursachen sammeln – die Cynefin-Einordnung erfolgt automatisch im nächsten Schritt." (Z. 1437) durch neutralen Text ersetzen, z. B. „Ursachen als kurze Nominalphrasen erfassen."

### 3. Steps-Datei (`src/features/framing/steps.ts`)
- Kommentar in Z. 29 entfernen bzw. aktualisieren („Nach Schritt 5 wurde `5b` (Cynefin) eingeschoben" → weg).

### 4. Datenbank (Bestandsdaten)
- Keine Migration nötig: `framing_steps.data` ist JSONB, das alte Feld `cynefin` in bestehenden `ursachen`-Items wird schlicht ignoriert. Optional (nicht Teil des Plans, außer du willst es): einmaliges Cleanup-Update, das das Property entfernt.

### 5. Verifikation
- `bunx tsgo --noEmit` muss grün sein (der `Cynefin`-Import und der `cynefin`-Default würden sonst brechen).
- Framing-Session öffnen, Schritt 5 (Root Cause) prüfen: Ursache hinzufügen, KI-Vorschlag übernehmen, weiter zu Schritt 6 (Annahmen) — keine Reste, kein Console-Error.

## Technische Details

- Bereich in `FramingStepCard.tsx` ist groß (~270 Zeilen) — am besten in einem Rutsch entfernen, damit keine dangling Imports / ungenutzten Types übrigbleiben (`noUnusedLocals` würde sonst zuschlagen).
- Bestehende `ursachen`-Objekte mit `cynefin`-Feld bleiben lesbar; TypeScript erlaubt Extra-Properties beim Zugriff nicht mehr, aber es wird nirgends mehr gelesen.