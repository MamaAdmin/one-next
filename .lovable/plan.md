# Whiteboard-Generator: Vereinfachung, Stil-Auswahl, deutsche Bildbeschreibungen

## Antworten auf deine Fragen

**Warum Englisch?** Das Skript fordert bewusst einen englischen `imagePrompt` an, weil Bildmodelle englische Beschreibungen zuverlässiger umsetzen. Der Stil-Zusatz (z. B. „black ink whiteboard marker line drawing") wird in der Funktion fest angehängt. Änderbar: Prompt auf Deutsch umstellen (aktuelle Modelle verstehen Deutsch gut) oder deutsch anzeigen und intern übersetzen.

**Briefing vs. Abschnitte:** Das Briefing ist die Eingabe, aus der die KI Skript, Zeichnungen und Stimme erzeugt; die Abschnitte unten sind das Ergebnis. Nach der Erzeugung wirkt das Briefing doppelt – daher wird es kompakter und klarer als „Startpunkt" geführt.

**Stile heute:** Es gibt aktuell genau einen fest einprogrammierten Stil: schwarze Strichzeichnung auf weissem Grund (Bilder) bzw. „Whiteboard animation style" (Videoclip). Keine Auswahl im Editor.

**Was Kie.ai zusätzlich kann (Auswahl, je nach Modell):** andere Bildstile (Fotorealismus, Comic, 3D, flache Illustrationen), Video-Modelle (Veo – fertige KI-Clips), weitere Sprecherstimmen.

**Credits (Richtwerte, Kie.ai-Abrechnung):** Skript (Text) praktisch gratis, Bild je nach Modell wenige Credits, Sprechstimme nach Textlänge günstig, Veo-Videoclip mit Abstand am teuersten. Genaue Preise hängen vom gewählten Modell ab – auf Wunsch kann die Funktion den tatsächlichen Verbrauch anzeigen.

**Flow Kie.ai ↔ Remotion:** Kie.ai erzeugt nur die Bausteine (Skript-Text, Zeichnungen, Audiodateien, optional KI-Videoclip). Remotion baut daraus im Browser das eigentliche Video: Titel, Abschnitte, zeichnende Hand, Bild-Einblendungen, Stimme – und exportiert die fertige MP4. Ohne Remotion gäbe es nur Einzeldateien, kein Video.

## Geplante Änderungen

1. **Stil-Auswahl im Editor** (Dropdown neben „Stimme"): Strichzeichnung schwarz-weiss (Standard), Bunte Marker, Bleistift-Skizze, Kreide auf dunkler Tafel, Comic/Cartoon, Flache Business-Illustration. Der gewählte Stil wird pro Video gespeichert und bei der Bilderzeugung angehängt.
2. **Deutsche Bildbeschreibungen:** Das Skript liefert `imagePrompt` künftig auf Deutsch; der englische Stil-Zusatz bleibt intern.
3. **Briefing verschlanken:** Briefing-Karte zu einer kompakten Eingabezeile (Thema + „Skript erzeugen") oberhalb der Abschnitte reduzieren; Titel, Stimme, Stil und Abschnitt-Anzahl bleiben, aber ohne doppelt wirkende Erklärtexte.

## Technische Details

- `supabase/functions/kie-whiteboard/index.ts`: Skript-Prompt auf deutschen `imagePrompt` umstellen; `style`-Parameter entgegennehmen und Stil-Zusatz je Stil mappen; neu deployen.
- `src/pages/admin/WhiteboardVideoEditor.tsx`: Stil-Dropdown, Briefing-Karte umbauen, `style` an `generateImage` weitergeben.
- `src/features/whiteboard/api.ts` + `types.ts`: `style`-Feld ergänzen (Default „Strichzeichnung"), Spalte `style` auf `whiteboard_videos` per Migration (JSONB-frei, einfache Textspalte mit Default).
- Stimmen-Liste bleibt unverändert.
