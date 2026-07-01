
## Ziel

Vor Schritt 1 einen neuen, nicht-interaktiven Erklärungs-Schritt einschieben, der die Arbeitsweise erklärt: Eigene Anmerkungen vs. KI-Vorschläge, optionale Recherche mit externen KI-Tools (Claude, Gemini, ChatGPT), Übernahme-Mechanik und Farbcode.

## UX

Der Intro-Schritt erscheint als Schritt 0 in der linken Navigation (mit Info-Icon statt Nummer), hat keine Timebox-Anzeige, keine Speicherung und keinen „Speichern"-Button – nur `Los geht's →`. „Zurück" ist ausgeblendet. Bestehende Sessions starten weiterhin auf Schritt 1 (kein forcierter Rücksprung), aber der Intro-Schritt ist jederzeit über die Sidebar erreichbar.

### Inhalt der Folie

**Titel:** „So arbeitest du im Problem-Framing-Workshop"

**Kurzintro (1–2 Sätze):** Jeder Schritt trennt sauber zwischen deinen eigenen Gedanken und Vorschlägen der KI. Du entscheidest, was übernommen wird.

**Block 1 – Eigene Anmerkungen**
- Textfeld/Liste mit Label „Eigene Anmerkungen".
- Alles, was du hier einträgst, bleibt unverändert dein Text.
- Wird nie automatisch mit KI-Inhalten überschrieben.

**Block 2 – KI-Vorschläge (im Akzent-Ton der One-Next-Palette)**
- Button „KI-Vorschläge" erzeugt kontextbezogene Ideen basierend auf deinen bisherigen Eingaben.
- Karten erscheinen im Akzent-Farbton – identisch zur Button-Farbe – klar unterscheidbar von eigenen Anmerkungen.
- Pro Karte: `Übernehmen` (verschiebt in Liste „Übernommene KI-Vorschläge") und `Verwerfen`.
- Übernommene Vorschläge behalten den Akzent-Farbton, um Herkunft sichtbar zu halten.
- Entfernen jederzeit per X möglich.

**Block 3 – Recherche mit externen KI-Tools (Claude, Gemini, ChatGPT)**
- Du kannst parallel in Claude, Gemini oder ChatGPT recherchieren.
- Empfohlener Prompt-Rahmen: Kontext des Sprints + konkrete Frage des aktuellen Schritts + „Gib mir 3–5 kurze Stichpunkte".
- Ergebnisse einzeln als eigene Zeile in „Eigene Anmerkungen" einfügen – oder als Notiz behalten und nur Kernpunkte übernehmen.
- Externe KI-Antworten sind nicht mit dem Akzent-Farbton markiert, weil sie außerhalb des Tools entstanden sind – du kuratierst sie bewusst.

**Block 4 – Farbcode auf einen Blick**
- Neutrale UI-Farbe: eigene Anmerkungen.
- One-Next-Akzent: alles KI (Button, Vorschlagskarten, übernommene KI-Liste).

**Block 5 – How-To in 5 Schritten**
1. Frage des Schritts lesen und mit eigenen Worten in „Eigene Anmerkungen" antworten.
2. Optional: Recherche in Claude / Gemini / ChatGPT, Kernpunkte in Eigene Anmerkungen ergänzen.
3. `KI-Vorschläge` klicken für ergänzende Ideen aus deinem Kontext.
4. Passende Karten `Übernehmen`, unpassende `Verwerfen`.
5. Ergebnis prüfen, `Weiter` klicken.

**Hinweisbox unten:** Timebox ist Orientierung, kein Zwang. Alles wird beim Weiterklicken gespeichert.

## Technische Umsetzung

### `src/features/framing/steps.ts`
- Neuen Eintrag `{ key: "intro", index: 0, title: "So arbeitest du hier", variant: "intro", timeboxMin: 0, nutztDatenAus: [], frage: "", arbeit: "" }` an Position 0 einfügen.
- `FramingVariant` um `"intro"` erweitern.
- `FRAMING_TOTAL_MIN` bleibt korrekt (0 addiert nichts).

### `src/components/framing/FramingStepCard.tsx`
- Für `variant === "intro"` reine Read-Only-Ansicht rendern: Titel, die fünf Blöcke oben, `Los geht's →` Button (ruft `onNext`), kein `onSave`, kein KI-Button. Icons: `Sparkles` (KI), `PenLine` (Eigene), `Search` (externe Recherche).
- Akzent-Ton konsistent zu vorhandenen KI-Karten (`border-accent/60 bg-accent-soft text-accent-foreground`).

### `src/pages/sprint/FramingWorkspace.tsx`
- Progress-Berechnung, Sidebar-Rendering und Timer-Anzeige müssen den Intro-Schritt behandeln:
  - Timer-Widget nur zeigen, wenn `currentDef.timeboxMin > 0`.
  - Progress: nur echte Schritte (index ≥ 1) zählen, Divisor entsprechend `FRAMING_STEPS.length - 1`.
  - Sidebar: Intro als eigener Eintrag mit Info-Icon, ohne „x′"-Badge.
  - `handleNext` von Index 0 → Index 1 unverändert; „Zurück" bei Intro und bei Index 1 ausgeblendet.
- `current_step` in der DB wird nicht auf 0 zurückgesetzt; neue Sessions starten weiter mit `current_step = 1`, der Intro-Schritt ist nur über Sidebar-Klick erreichbar.

### Nicht Teil dieser Änderung
- Kein DB-Migration, kein neues Feld.
- Kein Text in `warumJetzt` / `nichtZiele` / ähnliche User-Felder.
- Kein zusätzlicher Edge-Function-Call.
