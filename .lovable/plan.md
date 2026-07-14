## Ziel
Sprint- und Framing-Workspaces auf Tablet (768–1023px) und Smartphone (<768px) optimieren, nachdem sie auf Desktop nun 100% Breite nutzen.

## Aktueller Zustand
- Layout nutzt `grid lg:grid-cols-[240px_1fr]` bzw. `[280px_1fr]` — Side-Nav erscheint erst ab `lg` (1024px). Darunter stapelt alles vertikal, aber:
  - Padding `px-6 py-10 lg:py-16` ist auf Mobile zu groß.
  - Header/Timer/Titel brechen auf schmalen Screens unschön um.
  - Side-Nav auf Tablet fehlt komplett bzw. wird als langer Block oben angezeigt.
  - Karten-Innenpadding (`p-6`) verschwendet Platz auf Mobile.

## Änderungen

### 1. `FramingWorkspace.tsx` & `SprintWorkspace.tsx`
- Padding responsiv: `px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-16`.
- Header-Zeile: `flex-col sm:flex-row` für Titel/Timer, Timer volle Breite auf Mobile.
- Titel-Größe: `text-2xl sm:text-3xl`.
- Grid-Breakpoint auf `md`: `grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]` (Framing) bzw. `[240px_1fr] lg:[280px_1fr]` (Sprint), damit Tablet-Nav sichtbar wird.
- Auf Mobile: Side-Nav in ein aufklappbares `<details>`/Accordion (kompakte Schritt-Übersicht statt langer Liste oberhalb des Contents).

### 2. `FramingStepCard.tsx` / `SprintStepCard.tsx`
- Card-Padding responsiv: `p-4 sm:p-6`.
- Prev/Next-Buttons auf Mobile volle Breite (`w-full sm:w-auto`), Button-Row `flex-col sm:flex-row`.

### 3. `SprintDaySummary.tsx` / `FramingCompletionPanel.tsx`
- Padding und Grid-Spalten für Mobile prüfen und auf `sm:` umstellen.

### 4. `SprintBasicsEditDialog` / Sidebar-Header im Sprint
- Auf Mobile Titel-Zeile umbrechen lassen, Icon-Buttons kleiner.

## Nicht enthalten
- Keine Business-Logik-Änderungen.
- Keine Anpassungen an globalen Komponenten (Navigation, Footer).
- Keine Änderungen an Farb-Tokens oder Fonts.

## Verifikation
- `bunx tsgo --noEmit`.
- Preview in mobile (390px) und tablet (768px) Viewport prüfen.
