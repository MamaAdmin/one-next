## Ziel

Das Favicon in den Google-Suchergebnissen durch ein eigenes one-next-Icon ersetzen (statt des aktuellen Lovable-Default-Icons).

## Schritte

1. **Quadratisches Favicon erzeugen**: Mit `imagegen--edit_image` aus dem bestehenden Logo (`https://storage.googleapis.com/.../one-next-logo-new.png`) ein zentriertes, quadratisches PNG (512×512) auf transparentem Hintergrund erstellen und unter `public/favicon.png` ablegen.
2. **Alte Default-Datei entfernen**: `public/placeholder.svg` bleibt unberührt, aber falls noch ein `public/favicon.ico` (Vite-Default) existiert, wird sie gelöscht — sonst überschreibt sie das neue Favicon.
3. **`index.html` anpassen**:
   - Bestehende `<link rel="icon" ...>`-Zeile auf `/favicon.png` umstellen.
   - Zusätzlich `<link rel="apple-touch-icon" href="/favicon.png">` ergänzen.
4. **Publish**: Damit das neue Favicon live auf one-next.com und one-next.lovable.app ausgeliefert wird.

## Hinweise

- Google aktualisiert Favicons in den Suchergebnissen erst beim nächsten Crawl der Startseite — das kann **mehrere Tage bis Wochen** dauern. Nach dem Publish kann in der Google Search Console eine erneute Indexierung der Startseite angefordert werden, um den Prozess zu beschleunigen.
- Voraussetzungen laut Google: Favicon muss unter einer stabilen URL erreichbar sein, mindestens 48×48 px, quadratisch, und vom selben Host geliefert werden wie die Seite. All das wird mit Schritt 1–3 erfüllt.
