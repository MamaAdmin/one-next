
## Ziel
Die Seite `/sprint-uebersicht` (`src/pages/AIDesignSprint.tsx`) so umbauen, dass Besucher sofort die drei Angebote sehen und entscheiden können. Der „Coming soon"-Hinweis beim Online Design Sprint wird entfernt, da er fast fertig ist; stattdessen werden Solo- und Team-Modus benannt.

## Neue Seitenstruktur (Reihenfolge von oben nach unten)

1. **Hero** (unverändert, editierbarer Titel + Beschreibung, CTA)
2. **NEU: „Wählen Sie Ihren Design Sprint Ansatz"** – die drei Produktkarten direkt nach dem Hero
   - Problem-Framing-Workshop (mit KI) → Link zu `/problem-framing-workshop`
   - Design Sprint Workshop (mit KI) → Link zu `/design-sprint-workshop`
   - Online Design Sprint → Link zu `/sprint-uebersicht/online`, Button aktiv
3. „Was ist ein KI Design Sprint Workshop?" (4-Phasen-Flow) – bleibt
4. „Was können Sie erwarten?" – bleibt
5. Workshop-Agenda (Tag 1 / Tag 2) – bleibt
6. „Was Sie am Ende haben" – bleibt
7. „Warum ein KI Design Sprint Workshop?" – bleibt
8. CTA-Section (Dual Option) – bleibt

Der bisherige Produkt-Block weiter unten wird entfernt (verschoben nach oben), damit keine Dopplung entsteht.

## Änderungen an der Produktkarte „Online Design Sprint"

- „Coming soon"-Badge oben rechts entfernen.
- Titel von „Online Design Sprint (Coming soon)" → „Online Design Sprint".
- Subline: „Flexibel, strukturiert – im Solo- oder Team-Modus".
- Bullet-Liste ergänzen/ersetzen mit:
  - Strukturierter, selbstgeführter Prozess
  - **Solo-Modus**: Allein durchlaufen, alle Entscheidungen liegen beim Teilnehmer
  - **Team-Modus**: Gemeinsam mit verteiltem Team, Voting & Decider-Rolle
  - Flexibel pausieren & fortsetzen
  - Optionaler Experten-Input
- Button wieder funktional: „Sprint entdecken" → `<Link to="/sprint-uebersicht/online">` (statt leerem `<Button asChild>`).

## Technische Details

- Datei: `src/pages/AIDesignSprint.tsx`
- Bestehender Block „Wählen Sie Ihren Design Sprint Ansatz" (aktuell Zeilen ~302–430) wird direkt unter den Hero (nach Zeile 75) verschoben.
- Einleitungstext des Blocks bleibt: „Drei Wege führen zu KI-Innovation – wählen Sie den Ansatz, der am besten zu Ihrem Team passt."
- Hintergrund-Wechsel anpassen, damit Sektions-Farben weiterhin abwechseln (Hero schwarz → Produkte `bg-background` → Phasen `bg-muted/30` etc.).
- Keine Änderungen an Routing, Daten, oder anderen Seiten.
- Edit-Mode (`InlineTextField`/`InlineTextArea`) bleibt unverändert.
