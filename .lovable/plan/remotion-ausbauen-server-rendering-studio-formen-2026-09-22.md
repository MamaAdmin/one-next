# Remotion ausbauen: Server-Rendering, Studio, Formen

Drei Themen, unterschiedlich aufwendig. Reihenfolge: Formen (sofort sichtbar), Studio-Ansicht, Server-Rendering.

## 1. Formen aktiv nutzen (`@remotion/shapes`)

Das Paket ist installiert, wird aber nirgends verwendet. Es kommt als gestalterische Ebene in die Szenen:

- Grafik-Set pro Stil: Kreise, Dreiecke, Sterne, abgerundete Rechtecke, Ringe – Farben ausschliesslich aus dem bestehenden Theme.
- Hintergrund-Ebene: langsam driftende, grosse Formen mit niedriger Deckkraft statt leerer Fläche.
- Akzente: Ring oder Kreis, der beim Einblenden hinter Überschrift bzw. Stichpunkten aufzieht; Fortschrittsbogen statt reiner Balken.
- Übergangs-Motiv: eine Form, die von Abschnitt zu Abschnitt weiterwandert – sorgt für Serienlook.
- Alles rein visuell, keine Datenänderung, keine Kosten.

## 2. Studio-Ansicht

Remotion Studio selbst ist ein Entwickler-Werkzeug und läuft nicht in der veröffentlichten App. Stattdessen zwei Teile:

**a) Studio für die lokale Entwicklung** – `@remotion/cli`, `remotion.config.ts`, Einstiegsdatei `src/remotion/index.ts` mit registrierter Komposition plus `npm run studio`. Wer das Projekt lokal auszieht, kann Animationen dort feinjustieren; die App bleibt unverändert.

**b) Studio-artige Ansicht im Admin-Bereich** (das, was du im Browser tatsächlich nutzt) – neue Route `/admin/whiteboard-videos/:id/studio`:
- grosse Vorschau über den bestehenden Player
- Zeitleiste mit allen Abschnitten, Klick springt zum Abschnitt
- Bild-für-Bild-Navigation, Abspielgeschwindigkeit, Schleife über einen Abschnitt
- Live-Regler für Übergangslänge, Musiklautstärke, Untertitel an/aus
- Einzelbild als PNG sichern für Kontrollblicke

## 3. Server-seitiges Rendern

Heute entsteht das MP4 im Browser des Nutzers (`@remotion/web-renderer`). Das begrenzt Länge und Qualität und belastet den Rechner.

Echtes Server-Rendern braucht Node mit Chromium – die Backend-Funktionen dieses Projekts können das nicht leisten. Realistischer Weg: **Remotion Lambda** auf einem AWS-Konto.

Ablauf:
1. Render-Bündel wird einmalig auf AWS abgelegt (Deploy-Schritt, von mir vorbereitet als Skript).
2. Neue Backend-Funktion `whiteboard-render` startet den Render-Auftrag auf Lambda und gibt eine Auftragsnummer zurück.
3. Fortschritt wird abgefragt, fertiges MP4 landet im privaten Speicher und erscheint im Editor als Download.
4. Aufträge werden in einer neuen Tabelle `whiteboard_renders` protokolliert (Status, Dauer, Kosten, RLS wie bei `whiteboard_videos`).
5. Der Browser-Export bleibt als schnelle Alternative erhalten; Umschalter im Editor.

Dafür brauche ich von dir AWS-Zugangsdaten (Schlüssel und Region), die ich als Geheimnis hinterlege. Ohne AWS-Konto setze ich nur Teil 1 und 2 um.

## Technische Details

- `src/features/whiteboard/shapes.tsx` (neu): Form-Helfer auf Basis von `@remotion/shapes` (`Circle`, `Triangle`, `Star`, `Rect`, `Ellipse`), themenbasierte Farbwahl, deterministische Positionen über Szenen-Index und `seed`.
- `src/features/whiteboard/renderers.tsx` / `WhiteboardVideo.tsx`: Formen-Ebene hinter Medien und hinter Lower-Third; Fortschrittsbogen im `Overlay`.
- Studio lokal: `remotion.config.ts`, `src/remotion/index.ts` (`registerRoot`), `src/remotion/Root.tsx` mit `calculateMetadata` aus `compositionFrames`; Dev-Abhängigkeiten `@remotion/cli`, `@remotion/bundler`.
- Studio-Ansicht: `src/pages/admin/WhiteboardStudio.tsx`, Route in `App.tsx`, `playerRef` für `seekTo`/`getCurrentFrame`, `AdminBreadcrumb` wie gehabt.
- Lambda: `scripts/deploy-remotion-lambda.mjs`, Edge Function `whiteboard-render` (`renderMediaOnLambda` via REST-Aufruf an Lambda), Secrets `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `REMOTION_LAMBDA_FUNCTION`, `REMOTION_SERVE_URL`.
- Unverändert: Kie.ai-Erzeugung, Skript-Erzeugung über Gemini, Serien, Kosten- und Guthabenlogik.
