# Abgleich: Problem Framing Canvas (DSA) ↔ bestehender Framing-Workshop

Der Canvas von Design Sprint Academy ist ein 2×4-Raster (Business/Customer × Present/Past/Future/Needs) plus finalem Problem Statement. Vieles davon ist im bestehenden 11-Schritte-Workshop schon abgedeckt, ein paar Felder fehlen jedoch bzw. würden ihn schärfen.

## Was der Canvas hat vs. was wir schon haben

| Canvas-Feld | Status im Workshop | Empfehlung |
|---|---|---|
| Idea/Hypothesis/Challenge (Kopfzeile) | ~ Titel + Challenge Statement am Ende | schon abgedeckt |
| **Business – Present:** current state | ✓ Schritt 1 (Kontext) | ok |
| **Business – Past:** what worked / didn't work | ✗ fehlt | **neu ergänzen** |
| **Business – Future:** Wettbewerber, Trends, Chancen | teils ✓ (Sailboat Wind/Eisberg), aber Wettbewerb + Trends fehlen | **ergänzen** |
| **Business – Needs/Goals:** what do we want to achieve, KPIs | ✓ Schritt 7 (Erfolg & Constraints) | ok |
| **Customer – Present:** Zielgruppe, wann/wo, wie lösen sie heute | teils ✓ Schritt 3 (Stakeholder/Zielgruppe); "wie lösen sie heute" fehlt | **ergänzen** |
| **Customer – Past:** was hat Zielgruppe versucht, Enabler/Hindernisse | ✗ fehlt | **neu ergänzen** |
| **Customer – Future:** Trends bei Kunden, Default Future für sie | ✓ Schritt 2 (Default Future) – aber businesslastig | **auf Kunde erweitern** |
| **Customer – Needs/Goals:** welchen Schmerz lindern wir | teils ✓ (Zielgruppe/Erfolg), nicht explizit als Pain/Gain | **ergänzen** |
| **Problem Statement Template** (Our X has problem Y when Z, solution will A, business B) | ✓ Challenge Statement Generator | ok, ggf. Template angleichen |

## Vorschlag: 3 gezielte Erweiterungen

### 1. Schritt 1 („Kick-off & Zielbild") um „Past attempts" erweitern
Neues optionales Feld `frueherVersucht`: Liste mit `{ text, ergebnis: 'worked'|'didnt-work' }`. Beantwortet Business-Past des Canvas ohne neuen Schritt.

### 2. Schritt 3 („Stakeholder & Zielgruppe") um Customer-Present/Past/Pain erweitern
Zusätzliche Felder in `FramingStepData`:
- `kundeHeuteLoesung` (string) – "Wie lösen sie das Problem heute?"
- `kundeVersuchePast` (Array `{ text, worked }`)
- `kundePainGain` (string) – "Welchen Pain lindern wir, welchen Gain schaffen wir?"

Ein Schritt-Card-Abschnitt "Customer-Kontext (optional)" mit diesen drei Feldern.

### 3. Schritt 2 („Warum jetzt? & Default Future") um Trends/Wettbewerb erweitern
Zusätzliche Felder:
- `wettbewerber` (string[]) – "Was machen Wettbewerber / Vergleichbare?"
- `trends` (string[]) – "Trends für/gegen die Idee"
- `chancen` (string[]) – "Wo liegen Chancen?"

Damit ist Business-Future komplett abgedeckt, ohne einen zusätzlichen Navigationsschritt einzuführen.

## Was NICHT übernommen wird
- Kein neuer „Canvas"-Schritt und kein 2×4-Grid-UI – der geführte Wizard ist stärker als ein leeres Poster.
- Problem-Statement-Satzschablone bleibt beim bestehenden LLM-Challenge-Generator; wir könnten den Prompt aber um den DSA-Wortlaut ("Our … has the problem … when … Our solution will … and also help our business …") ergänzen, damit das Ergebnis dem Canvas-Format entspricht.

## Technische Umsetzung (kurz)
- `src/features/framing/types.ts`: neue optionale Felder in `FramingStepData` (keine DB-Migration nötig – Daten liegen in `jsonb data`).
- `src/components/framing/FramingStepCard.tsx`: in den Varianten `context-list` (Schritt 1), `two-fields` (Schritt 2) und `stakeholder` (Schritt 3) je einen ausklappbaren „Weitere Canvas-Felder"-Block anhängen.
- `supabase/functions/framing-generate-challenge/index.ts`: Prompt so anpassen, dass die neuen Felder in das Challenge-Statement einfließen und die Ausgabe optional dem Canvas-Satzbau folgt.

## Offene Frage vor Umsetzung
Sollen die Canvas-Felder **verpflichtend** in die drei Schritte integriert werden, oder als **optionaler „Canvas-Modus" pro Session** einschaltbar sein? Das entscheidet, ob wir bestehende Sessions unangetastet lassen oder die UI standardmäßig länger machen.
