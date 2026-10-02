# KI-Werkstatt: Vorschau auf der Startseite und eigene Seite

## Was entsteht
1. **Vorschau auf der Startseite** direkt unter «Wir machen … praktisch nutzbar» (Abschnitt mit „Termin vereinbaren“ / „Kontaktanfrage“):
   - Kurze Überschrift „Die one-next Werkstatt“, ein Satz zum Beispielprojekt (Rechnungseingang mit KI in fünf Schritten).
   - Die fünf Schritte als schlanke, einzeilige Liste.
   - Button „Werkstatt erleben“ führt auf die neue Seite.
   - Leichtgewichtig, ohne 3D, damit die Startseite schnell bleibt.
2. **Neue Seite `/werkstatt`** mit der vollständigen 3D-Scroll-Werkstatt aus der ZIP-Datei (Szene, Schrittkarte, Bots, Tempo-Steuerung).
   - Eigene Kopfzeile der Werkstatt entfällt, stattdessen normale Website-Navigation und Footer.
   - Der Kontaktbereich der Werkstatt verlinkt auf das bestehende Anfrageformular unter Kontakt; Buttons „Erstgespräch vereinbaren“ öffnen die bestehende Terminbuchung.
   - Texte angepasst an Projektregeln: „KI Design Sprints“ wird „Design Sprints“, Satzschreibweise, kein Telefon.

## Technische Details
- Dateien übernehmen nach `src/features/werkstatt/` (`engine.ts`, `Werkstatt.tsx`, `werkstatt.css`); Seite `src/pages/Werkstatt.tsx`, Route in `App.tsx` (lazy geladen).
- `three@0.128.0` installieren (Engine nutzt `sRGBEncoding`; neuere Versionen inkompatibel).
- Globale CSS-Regeln (`body`, `*`) auf einen Wrapper `.werkstatt-root` einschränken, damit der Rest der Website unberührt bleibt; Fonts über bestehende Projektschriften statt Inter.
- Aufräumfunktion von `initWerkstatt()` beim Verlassen der Seite aufrufen (Scroll-Listener, Renderer).
- Vorschau als neue Komponente `WerkstattTeaser.tsx`, eingebunden in `About.tsx` bzw. `Index.tsx` direkt nach dem Abschnitt.
- Prüfung per Screenshot: Startseite und `/werkstatt` (3D sichtbar, keine Konsolenfehler), Eintrag in `sitemap.xml`.
