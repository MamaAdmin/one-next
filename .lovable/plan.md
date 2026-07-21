## Ziel
Die bestehende one-next-Palette (warmes Creme, Schieferblau, Taupe, Charcoal) wird zu einem vollständigen, skalierbaren Corporate-Design-Farbsystem ausgebaut. Alle Farben landen als semantische CSS-Variablen in `src/index.css` und als Tailwind-Tokens in `tailwind.config.ts`, damit sie im gesamten Projekt konsistent verwendet werden können.

## Aktueller Stand (bestätigt durch Code-Read)
- `src/index.css` enthält bereits eine erste Token-Ebene: `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`, `--border`, `--ring` usw.
- `tailwind.config.ts` mapped diese Tokens auf `colors` und `backgroundImage`/`boxShadow`.
- Es fehlt aber ein systematisches Corporate-Design-Set: keine klaren Brand-Primär-/Sekundär-/Tertiär-Farben, keine ausgewachsene Neutral-Skala, keine semantischen Status- und Feedback-Farben.

## Schritte

### 1. Farbstrategie definieren
Auf Basis der gewählten Richtung **Cream & Slate** entwickeln wir:
- **Brand-Primär**: Tiefes Schieferblau (bestehendes `--primary`)
- **Brand-Sekundär**: Warmes Taupe/Stone (bestehendes `--secondary`)
- **Brand-Akzent**: Dusty Slate Blue (bestehendes `--accent`)
- **Brand-Hintergrund**: Warmes Cremeweiß (bestehendes `--background`)
- **Neutral-Skala**: 10–12 Abstufungen von Creme bis Charcoal
- **Semantische Farben**: Erfolg, Warnung, Fehler, Info – jeweils in HSL und auf die bestehende Palette abgestimmt
- **Dunkelmodus**: Gegenentwurf für alle neuen Tokens

### 2. Token-Architektur in `src/index.css` erweitern
- Neue Variablen ergänzen, ohne bestehende zu zerstören (Abwärtskompatibilität):
  - `--brand-primary`, `--brand-secondary`, `--brand-accent`
  - `--neutral-50` … `--neutral-950`
  - `--success`, `--warning`, `--error`, `--info` (inkl. `-foreground`, `-soft`, `-strong`)
  - `--surface-default`, `--surface-elevated`, `--surface-overlay`
  - `--text-default`, `--text-muted`, `--text-placeholder`, `--text-on-dark`
- Bestehende Tokens bleiben erhalten und werden auf die neuen Brand-Tokens abgebildet, wo sinnvoll.

### 3. Tailwind-Config erweitern
- Neue Farb-Keys in `theme.extend.colors` ergänzen:
  - `brand.primary`, `brand.secondary`, `brand.accent`
  - `neutral.*`
  - `success`, `warning`, `error`, `info`
  - `surface.*`, `text.*`
- Sicherstellen, dass alle neuen Werte auf `hsl(var(--...))` verweisen.

### 4. Kontrast & Accessibility prüfen
- Für jede neu definierte Vordergrundfarbe auf den entsprechenden Hintergründen prüfen, ob WCAG-AA-Kontrast erreicht wird.
- Ggf. Anpassungen an HSL-Lightness vornehmen, bis alle Kombinationen AA-konform sind.

### 5. Interne Referenz erstellen
- Neues Komponente/Seite `src/components/design/ColorTokens.tsx` oder `src/pages/DesignSystem.tsx` anlegen.
- Zeigt alle Brand-, Neutral- und Semantik-Farben mit Namen, HSL-Wert und Vordergrund-Kontrast.
- Nicht öffentlich verlinken; dient als interne Dokumentation im Preview.

### 6. Migration der hartcodierten Farben (optional, falls im Scope gewünscht)
- Suche nach `text-white`, `bg-black`, `bg-[#...]`, `text-blue-600` etc. im `src/`-Code.
- Ersetzen durch semantische Tokens aus dem neuen System.
- Hinweis: Das passiert nur, wenn du es explizit willst; sonst bleiben bestehende hartcodierte Utility-Klassen unverändert.

## Deliverables
- Erweiterte `src/index.css` mit vollständigem semantischen Token-Set
- Erweiterte `tailwind.config.ts` mit neuen Farb-Keys
- Interne Farbreferenz-Komponente/Seite
- Kurze Dokumentation der Farbregeln (z. B. im Projekt-Memory)

## Nicht im Scope
- Keine Änderung an Layout, Typografie oder Komponenten-Logik
- Keine öffentliche Design-System-Landingpage (nur interne Referenz)

Sobald du den Plan freigibst, baue ich das Token-System Schritt für Schritt um.