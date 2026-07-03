## Ziel
Bei jedem Framing-Schritt sichtbar machen, **warum genau diese Übung jetzt sinnvoll ist** – als kurzer Nutzen-Hinweis direkt unter der Aufgaben-Beschreibung.

## Änderungen

### 1. `src/features/framing/steps.ts`
- `FramingStepDef` um Feld `nutzen: string` erweitern (Pflicht ab Schritt 1; für `intro` leer/optional).
- Für jeden Schritt (1–11) einen kurzen Nutzen-Text pflegen. Formulierung: 1–2 Sätze, konkret, aus Sicht des Nutzers, beantwortet „Was habe ich davon, wenn ich diesen Schritt jetzt mache?".

Beispiele (finale Formulierungen im Code, hier zur Illustration):
- **1. Kick-off & Zielbild:** „Damit dein Team ab jetzt vom gleichen Ausgangspunkt startet und du später keine Diskussionen über den Scope neu aufmachen musst."
- **2. Gegenwart / Vergangenheit / Zukunft:** „Damit klar wird, warum jetzt der richtige Zeitpunkt ist – und du erkennst, was passiert, wenn ihr nichts ändert."
- **3. Stakeholder & Zielgruppe:** „Damit du weißt, für wen du löst und wessen Meinung im Sprint zählt – bevor du dich in Details verlierst."
- **4. Smart Sailboat:** „Um Treiber, Bremsen, Ziel und Risiken in einem Bild zu sehen, statt sie über zehn Meetings verstreut zu sammeln."
- **5. Root Cause (5 Whys):** „Damit du am echten Problem arbeitest, nicht am Symptom – sonst löst der Sprint das Falsche."
- **6. Cynefin-Einordnung:** „Damit du weißt, ob du einfach umsetzen, testen oder erst noch probieren musst – das bestimmt den weiteren Vorgehensmodus."
- **7. Annahmen & Risiken:** „Damit du erkennst, welche unsicheren Annahmen das ganze Vorhaben killen können – die musst du im Sprint testen."
- **8. Erfolg & Constraints:** „Damit am Ende des Sprints messbar ist, ob er sich gelohnt hat – und du weißt, was du nicht anfassen darfst."
- **9. Scope-Cut & Sprint-Fragen:** „Um den Sprint auf eine bearbeitbare Frage einzudampfen, statt fünf Themen halb zu bearbeiten."
- **10. Priorisierung (NUF):** „Damit du auf die eine Frage fokussierst, die neu, nützlich und machbar ist – nicht auf die lauteste."
- **11. Entscheidung & Next Steps:** „Damit das Framing verbindlich in einen Sprint mündet und nicht als Word-Dokument liegen bleibt."

### 2. `src/components/framing/FramingStepCard.tsx` (~Zeile 189)
Direkt unter `<p>{step.arbeit}</p>` einen Callout einfügen (nur wenn `step.nutzen` gesetzt):

```tsx
{step.nutzen ? (
  <div className="mt-3 flex gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
    <Lightbulb className="w-4 h-4 mt-0.5 text-primary shrink-0" />
    <div className="text-sm">
      <span className="font-medium text-primary">Warum jetzt? </span>
      <span className="text-foreground/80">{step.nutzen}</span>
    </div>
  </div>
) : null}
```

- Icon `Lightbulb` aus `lucide-react` importieren.
- Farb-Tokens (`text-primary`, `bg-primary/5`, `border-primary/20`) – keine Hardcodes.

### 3. Kein DB-, kein Backend-Change
Nur Content + Presentation. Beschriftung „Warum jetzt?" bleibt einheitlich.