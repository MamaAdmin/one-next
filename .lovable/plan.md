# Problem-Framing-Workshop: Datenfluss schärfen

Der Workshop bleibt in Aufbau und Schrittnummern unverändert. Geändert werden Inhalte einzelner Schritte, die Weitergabe von Ergebnissen zwischen den Schritten und die Qualität des erzeugten Challenge Statements. Bestehende Sessions bleiben vollständig nutzbar.

## Entscheidungen, die ich im Plan schon getroffen habe

- **Zeiten**: Ich behalte deine Timeboxen von der öffentlichen Workshop-Seite (15/15/30/15/15/20/20/25/15/15). Die kürzeren Zeiten aus dem Vorschlag würden der Webseite widersprechen.
- **Generieren-Sperre**: greift nur bei neuen Sessions. Bestehende Sessions können weiterhin ein Statement erzeugen.
- **KI-Vorschläge**: nicht mehr dauerhaft mitgespeichert, damit abgelehnte Vorschläge nicht ins Ergebnis rutschen.

## Was sich im Workshop ändert

**Schritt 1 – Kick-off, Langfristziel & Abgrenzung**
Neues Feld „Langfristziel" („In zwei Jahren wird …") plus Zeithorizont. Das Langfristziel ist ab jetzt der Bezugspunkt für alle folgenden Schritte.

**Schritt 4 – Smart Sailboat wird Verdichtung**
Die vier Felder sind beim ersten Öffnen bereits befüllt: Hafen aus dem Langfristziel, Wind aus Chancen und Trends, Anker aus gescheiterten Versuchen und Pain-Punkten, Eisberg aus der Standard-Zukunft. Übernommene Einträge sind gekennzeichnet, frei editierbar und löschbar. Die Vorbefüllung passiert genau einmal. Der KI-Knopf heisst dort „Ergänzen".

**Schritt 5 – Root Cause**
Neues Pflichtfeld „Beobachtetes Symptom" über der Warum-Kette, vorbefüllt mit dem ersten Anker aus Schritt 4.

**Schritt 7 – nur noch Constraints**
Die Erfolgsmessung wandert von hier nach Schritt 9.

**Schritt 9 – Priorisierung und Erfolgsmessung**
Der wichtigste Fix: Schritt 9 übernimmt jetzt automatisch alle Sprint-Fragen aus Schritt 8, ohne bereits vergebene Bewertungen zu überschreiben. Die drei Bewertungsachsen bekommen verständliche Beschriftungen („Neu – noch unbeantwortet", „Nützlich – verändert Entscheidungen", „Realisierbar – in 5 Tagen prüfbar") und einen kurzen Erklärtext. Sobald eine Top-1-Frage gewählt ist, erscheint darunter die Erfolgsmessung mit Bezug auf genau diese Frage.

**Alle Schritte – Warnhinweise statt Blockade**
Beim Abschliessen eines Schritts erscheinen fehlende Angaben als gelber Hinweis. Der Knopf bleibt aktiv, Weiterarbeiten ist immer möglich.

**Pausenhinweis** nach Schritt 6.

## Abschluss und Challenge Statement

- Die Definition of Done bekommt zwei Punkte: „Langfristziel formuliert" und „Top-1-Sprint-Frage gewählt".
- Die Erfolgsmessung wird aus Schritt 9 gelesen, bei älteren Sessions ersatzweise aus Schritt 7.
- Bei neuen Sessions bleibt „Challenge Statement generieren" gesperrt, solange Langfristziel, Zielgruppe, adressierbare Ursache, Sprint-Frage oder Top-1-Frage fehlen. Darüber steht, was genau fehlt, jeweils mit Sprung zum Schritt.
- Das erzeugte Statement hat genau vier Sätze: Zielgruppe und Ursache, Folgen ohne Änderung, Langfristziel mit Zeithorizont, und wörtlich die gewählte Sprint-Frage. Risiken kommen nur aus Eisberg-Einträgen und hoch bewerteten Annahmen. Nichts wird erfunden.

## Technische Umsetzung

- `src/features/framing/steps.ts`: Titel, Fragen, Arbeitsbeschreibungen und `nutztDatenAus` gemäss Vorschlag; Timeboxen bleiben unverändert; `FramingStepDef` erhält optional `pausenHinweis`.
- `src/features/framing/types.ts`: neue Felder `langfristziel`, `langfristzielHorizont`, `kiLangfristziel`, `symptom`, `kiSymptom`, `sailboatVorbefuellt`. `erfolgsmessung`/`kiErfolgsmessung` bleiben, werden künftig unter `step_key: "9"` gespeichert.
- `src/components/framing/FramingStepCard.tsx`: `vorschlaege` nicht mehr in `onSave` schreiben und Altbestand entfernen; `allSteps` an `VariantNuf` durchreichen und Fragen aus Schritt 8 einmalig übernehmen (Vergleich auf getrimmten Text, `isKi` ebenfalls getrimmt vergleichen); Erfolgsteil aus `VariantSuccessConstraints` nach `VariantNuf` verschieben; Vorbefüllung in `VariantSailboat` (`defaultFuture` kann Text oder Liste sein; „früher Versucht" liegt in Schritt 1, Kundenversuche und Pain/Gain in Schritt 3); Symptomfeld in `VariantFiveWhys`; `applySuggestion` um die Tags `[Ziel]`, `[Symptom]`, `[Erfolg]` erweitern; Pausenhinweis anzeigen.
- Neu `src/features/framing/validation.ts` mit `getStepWarnings(stepKey, data)` wie im Vorschlag; Anzeige als Hinweisblock über „Abschliessen & weiter".
- `src/components/framing/FramingCompletionPanel.tsx`: Erfolgsmessung aus Schritt 9 mit Rückfall auf Schritt 7; zwei neue DoD-Punkte; Sperrlogik nur für Sessions, die nach dieser Änderung angelegt wurden (ältere Sessions behalten das bisherige Verhalten inklusive Auto-Generierung).
- `supabase/functions/framing-generate-challenge/index.ts`: `buildContext` ersetzen (Block „Gesetzte Entscheidungen" plus bereinigtes Material, ohne `vorschlaege`, `stakeholderPositions`, `notes`); neuer System-Prompt; `temperature` 0.3.
- `supabase/functions/framing-ai-suggest/index.ts`: `STEP_DEPS` einführen und den Kontext darauf filtern; dieselben Schlüssel entfernen; neue Buckets `ziel` (Schritt 1), `symptom` (Schritt 5), `erfolg` (Schritt 9); Aufgabentext für Schritt 4 auf „höchstens 2 Ergänzungen je Kategorie".
- Keine Datenbankmigration: die Schrittdaten liegen als JSON. Keine Änderungen an `src/features/sprint/` oder `SprintStepCard.tsx`.

## Prüfung zum Schluss

Typprüfung, dann eine bestehende Session mit Daten öffnen und alle zehn Schritte durchgehen: alte Eingaben vorhanden, Schritt 9 zeigt die Fragen aus Schritt 8, Schritt 4 befüllt sich nur einmal, Schritt 7 ohne Erfolgsmessung, Abschluss-Panel findet die Messung in beiden Varianten, Statement hat vier Sätze und endet mit der gewählten Frage. Desktop und Smartphone.
