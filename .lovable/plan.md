# Design-Politur one-next

Ziel: Das bestehende, warm-neutrale Farbschema und die Grundstruktur bleiben. Wir schärfen Typografie, Farbkontraste, Hierarchie und Detail-Qualität, damit die Seite ruhiger, konsistenter und hochwertiger wirkt – im Stil moderner B2B-Studios (Linear, Vercel, Rauch-artige Editorial-Anmutung), aber weiterhin warm/menschlich.

## 1. Typografie-System
- Eine seriöse Editorial-Kombi einführen: **Instrument Serif** (Display/H1) + **Inter** oder **Söhne-Alternative (Geist / Söhne / Inter Tight)** für Body/UI.
- Klare Type-Scale (Tailwind-Extension): `display-xl`, `display-lg`, `h1`–`h4`, `body-lg`, `body`, `body-sm`, `overline`.
- Zeilenlängen begrenzen (`max-w-prose` auf Fließtext), `tracking-tight` nur auf Display, `leading-[1.15]` auf großen Headlines.
- Farbverlauf-Headline (`bg-gradient-primary bg-clip-text`) sparsamer einsetzen – nur 1× pro Sektion.

## 2. Farb- & Token-Verfeinerung
- Sekundäre Neutralen-Palette einführen (`--surface`, `--surface-muted`, `--border-subtle`, `--border-strong`) statt nur `background/muted/border`.
- Akzentfarbe (`--accent`) auf einen ruhigeren Ton kalibrieren (z. B. gedecktes Terracotta oder tiefes Petrol) – nicht das aktuelle Rosé, das billig wirken kann.
- Feste Fokus- und Hover-States: `--ring` sichtbarer, `hover:bg-surface-muted` einheitlich.
- Dark-Mode Kontraste prüfen (Text auf Card >= 7:1).

## 3. Spacing, Rhythmus, Layout
- Sektions-Rhythmus vereinheitlichen: `py-24 md:py-32`, konsistente `container` (max-w-6xl) statt gemischter Breiten.
- 8-Punkt-Grid disziplinieren; Karten mit einheitlichem Padding `p-6 md:p-8` und `gap-6`.
- Radius reduzieren: aktuell `--radius: 1.5rem` ist sehr weich; auf `1rem` senken, für Buttons/Chips `0.75rem`. Wirkt professioneller, weniger „App-Prototyp".

## 4. Komponenten-Politur
- **Buttons**: klare Hierarchie – Primary (solid, dunkel), Secondary (Outline mit `border-strong`), Ghost. Konsistente Höhe (`h-11`), Icon-Abstand `gap-2`.
- **Cards**: einheitliche Border (`border border-border-subtle`), sehr dezenter Shadow, Hover: nur Border-Farbwechsel + 1 px Lift, kein starker Shadow-Sprung.
- **Badges/Tags**: schmaler, `uppercase text-[11px] tracking-wider`.
- **Navigation**: dünner (`h-16`), Backdrop-Blur, unten 1 px `border-subtle`, Logo auf `h-7` reduzieren.
- **Footer**: dreispaltig, dezenter Divider, keine dekorativen Farbflächen.

## 5. Hero & Landing
- Ruhigerer Hero: großes Serif-Statement links, kleiner erklärender Absatz + zwei CTAs, rechts entweder ruhige Grafik oder gar nichts – aktuell zu viel visuelles Rauschen.
- Micro-Kicker („Für Innovationsteams") in Overline-Style.
- Trust-Row (Kundenlogos oder Zahlen) direkt unter dem Hero.

## 6. Bilder & Icons
- Einheitlicher Icon-Set (nur `lucide-react`), Stroke 1.5, Größe `h-4`/`h-5`.
- Bilder: einheitlicher Look (leichte Entsättigung wie im Blog `0.9`), einheitliches Seitenverhältnis (16:10 oder 4:5), abgerundet `rounded-xl`.

## 7. Motion & Interaktion
- Vorhandene `reveal-on-scroll` behalten, aber Distanz auf `translateY(8px)` reduzieren, Dauer 500ms, `ease-out`.
- Hover-Transforms nur noch auf interaktive Elemente, nicht auf Karten mit Link innen.

## 8. Konsistenz-Cleanup
- Alle `text-white`/`bg-black`/Hex-Klassen durch semantische Tokens ersetzen (Grep + Fix).
- `App.css` (React-Vite-Boilerplate mit `#root max-width: 1280px; text-align: center`) entfernen – überschreibt heute stellenweise Layout.
- Doppelte Container-Breiten vereinheitlichen.

## Umsetzung in Phasen
1. **Foundation** (kein visueller Bruch nötig): Tokens erweitern, Radius/Spacing/Type-Scale in `index.css` + `tailwind.config.ts`, `App.css` bereinigen.
2. **Core-Komponenten**: Button, Card, Badge, Navigation, Footer.
3. **Landing-Sektionen**: Hero, ValueCards, About, Services – auf neues System heben.
4. **Sekundärseiten**: Sprint-Dashboard, Blog, LMS-Übersichten nachziehen.
5. **QA**: Kontraste, Dark-Mode, Mobile, Lighthouse.

## Technische Details
- Betroffene Dateien primär: `src/index.css`, `tailwind.config.ts`, `src/App.css` (löschen/leeren), `src/components/ui/button.tsx`, `card.tsx`, `badge.tsx`, `Navigation.tsx`, `Footer.tsx`, `Hero.tsx`, `ValueCards.tsx`, `About.tsx`, `Services.tsx`.
- Keine Business-Logik-Änderungen, keine Routen-, Auth- oder Backend-Änderungen.
- Fonts via `<link>` in `index.html` (Google Fonts: Instrument Serif + Inter Tight).

## Nicht Teil dieses Plans
- Neue Features, Content-Umbauten, neue Seiten.
- Änderungen an Sprint-/Framing-/LMS-Logik.
- Marken-Redesign (Logo, Name, Claim).

Sag mir, ob ich mit **Phase 1 (Foundation + Cleanup)** starten soll, oder ob du zuerst 3 gerenderte Design-Direktionen für den Hero sehen willst, bevor wir das System festziehen.
