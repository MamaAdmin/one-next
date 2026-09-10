# Stilbibliothek als Galerie mit Vorschaubildern und Play-Knopf

## Was entsteht

Die Seite „Stilbibliothek“ wird von einer Textliste zu einer Bildergalerie:

- Jede Stilkarte bekommt oben ein Vorschaubild, das den Stil zeigt.
- Über dem Bild liegt ein runder Play-Knopf.
- Klick auf Bild oder Play-Knopf öffnet ein Fenster über der Seite:
  - YouTube-Beispiele laufen direkt in diesem Fenster.
  - Beispiele, die auf eine Webseite statt auf ein Video zeigen (Agentur-Portfolios wie Demo Duck, Vidico, Kasra, simpleshow), zeigen im Fenster einen kurzen Hinweis und einen Knopf „Beispiele ansehen“, der die Seite in einem neuen Tab öffnet.
- Unter dem Bild bleiben Merkmale, Einsatzzweck, Skriptart und das Kennzeichen „Erzeugbar“ / „Nur Vorlage“ erhalten.
- Die Abschnitte „Welcher Stil passt zu meinem Lernziel?“ und „Skriptarten“ bleiben unverändert.

## Vorschaubilder

Für alle zwölf Stile wird je ein Vorschaubild erzeugt, das typisch für den Stil ist (Whiteboard-Zeichnung, Flat-2D-Szene, Figurenszene, Motion-Graphics-Kachel, Infografik, Software-Oberfläche, Screencast mit Illustration, isometrische Technikszene, Typo-Bild, Sprecherfigur, Mixed Media, Live-Action). Format 16:9, ohne Text im Bild, im Stil der bestehenden Farbwelt.

## Technische Details

- Neue Bilder unter `src/assets/styles/<style-value>.jpg`, generiert 1024x576, als ES6-Import in einer Map `STYLE_THUMBS: Record<string, string>` in einer neuen Datei `src/features/whiteboard/styleThumbs.ts`.
- `src/features/whiteboard/styles.ts`: keine Datenänderung nötig; optional Hilfsfunktion `youtubeId(url)` wird stattdessen lokal in der Seite ergänzt (Erkennung `watch?v=`, `youtu.be/`, `/embed/`; sonst `null`).
- `src/pages/admin/StyleLibrary.tsx`:
  - Galerie-Grid `grid gap-6 md:grid-cols-2 xl:grid-cols-3`.
  - Karte: `AspectRatio` 16/9 mit `<img loading="lazy" alt="Beispielbild für Stil …">`, darüber ein Overlay-Button (`absolute inset-0`, zentrierter Kreis mit `Play`-Icon, `aria-label="Beispielvideo abspielen"`), Fokus-Ring über Tokens.
  - State `activeStyle`; `Dialog` aus shadcn mit `DialogContent` in `max-w-3xl`, darin bei YouTube ein `<iframe>` (`https://www.youtube-nocookie.com/embed/<id>?autoplay=1`, `allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"`, `allowFullScreen`, 16:9) — sonst Hinweistext plus `Button asChild` mit `target="_blank" rel="noopener noreferrer"`.
  - Beim Schliessen wird `activeStyle` auf `null` gesetzt, damit das iframe entfernt wird und die Wiedergabe stoppt.
  - Nur Design-Tokens, keine harten Farben.
