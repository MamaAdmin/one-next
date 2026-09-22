# Dünne hellblaue Rahmen statt gefüllter Buttons

## Ziel
Auf allen Seiten und in allen Navigationspunkten erscheinen Buttons und interaktive Elemente als feine, helle Kästen mit dünnem hellblauem Rahmen – keine kräftig gefüllten Flächen mehr.

## Umsetzung

1. **Neuer Rahmenfarbton** (`src/index.css`)
   - Semantischer Token `--border-accent` (hellblau, aus der bestehenden Slate-Blue-Palette, hell- und dunkelmodustauglich).

2. **Button-Stile umstellen** (`src/components/ui/button.tsx`)
   - `default`: transparenter Hintergrund, 1-px-Rahmen in Hellblau, dunkle Schrift; beim Darüberfahren leicht hellblau getönt.
   - `secondary` und `outline`: ebenfalls dünner hellblauer Rahmen statt grauer Fläche.
   - `destructive` bleibt erkennbar, aber ebenfalls als Rahmen-Stil (roter dünner Rahmen).
   - Schriftgewicht auf „normal" statt „medium" für einen leichteren Eindruck.

3. **Navigation** (`src/components/ui/Navbar5.tsx`)
   - Menüpunkte und Unternavigation ohne gefüllte aktive Zustände; aktiver Punkt wird über dünnen hellblauen Rahmen und hellblaue Tönung markiert.
   - Konto-/Anmeldebereich im gleichen Rahmenstil.

4. **Seitenweite Konsistenz**
   - Karten und hervorgehobene Kästen, die aktuell kräftig gefüllt sind (z. B. CTA-Flächen mit `bg-primary`), erhalten weissen/transparenten Hintergrund mit dünnem hellblauen Rahmen.
   - Prüfung der wichtigsten Seiten: Startseite, Leistungen, Problem-Framing-Workshop, Design Sprint, Kontakt, Blog.

5. **Prüfung**
   - `npx tsgo --noEmit`
   - Sichtprüfung Desktop und Mobil (Navigation, Startseite, Workshop-Seite).

## Technische Details
- Nur Gestaltung: Design-Tokens, Button-Varianten, Navigations- und Kartenklassen.
- Keine inhaltlichen oder funktionalen Änderungen; Links, Rollenlogik und Buchungswege bleiben unverändert.
- Dark-Mode-Token werden parallel angepasst.
