## Ziel
Auf Tablet (<lg) und Mobile beim Klick auf einen Navigationspunkt (z. B. „Ziel") in Sprint- und Framing-Workspace:
1. Zum Anfang des ausgewählten Schritts scrollen.
2. Die Tages-/Schritt-Navigation automatisch einklappen.

## Aktueller Zustand
- Side-Nav ist in `SprintWorkspace.tsx` und `FramingWorkspace.tsx` ab `md:` als Sidebar sichtbar, darunter dauerhaft oben als langer Block.
- Beim Klick auf einen Nav-Eintrag passiert nur `goTo(...)` → State-Wechsel, kein Scroll, kein Einklappen. Auf Mobile bleibt man ganz oben in der langen Nav-Liste und sieht den Step-Inhalt nicht.

## Änderungen

### 1. Nav auf Mobile/Tablet als Accordion
- In `SprintWorkspace.tsx` und `FramingWorkspace.tsx` die `<aside>`-Nav für `<lg` in ein `<details>` (bzw. shadcn `Collapsible`) verpacken.
- Ab `lg:` bleibt sie klassische Sticky-Sidebar (kein Accordion).
- Summary zeigt: aktueller Schritt-Titel + kleiner Chevron. Standard: eingeklappt auf Mobile/Tablet.
- State `navOpen` (nur relevant <lg) steuert das Öffnen; nach `goTo()` wird `navOpen=false` gesetzt.

### 2. Scroll-to-Content beim Nav-Klick
- Ref `contentRef` auf den rechten Content-Container legen.
- Nach `goTo(...)` (und `openSummary(...)` im Sprint) auf Mobile/Tablet: `contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })`.
- Auf Desktop (`lg+`) kein erzwungenes Scrollen, da Sidebar+Content nebeneinander stehen.
- Breakpoint-Check via `window.matchMedia("(max-width: 1023px)")`.

### 3. Betroffene Dateien
- `src/pages/sprint/SprintWorkspace.tsx`
- `src/pages/sprint/FramingWorkspace.tsx`

Keine Änderungen an Business-Logik, Steps-Datenmodell oder Design-Tokens.

## Verifikation
- `bunx tsgo --noEmit`.
- Manuelles Prüfen bei 390px und 768px: Nav ist standardmäßig eingeklappt, öffnet auf Klick, klappt nach Auswahl zu, Content scrollt nach oben.
- Desktop (≥1024px) unverändert.
