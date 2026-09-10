# Drei Korrekturen im Whiteboard-Video-Bereich

## Antwort zu Frage 2 (Abgleich und Preise)

"Mit Kie.ai abgleichen" schreibt **keine Preise**. Der Abgleich lädt die Kie.ai-Dokumentation, lässt sie mit der bestehenden Modellliste vergleichen und speichert das Ergebnis nur als Vorschlagsliste (Name, Anzeigename, Anbieter, Kategorie, Einheit, Beschreibung, Einsatzzwecke, Doku-Link) in einer Protokolltabelle. Die Anweisung an die KI lautet ausdrücklich "erfinde keine Preise". Es wird also weder `credits_per_unit` noch ein anderes Feld der Modelltabelle verändert – Preise sind rein manuell gepflegt. Deshalb ist das Vertauschen von Veo 3 und Veo 3 Fast eine reine Handeingabe und wird von mir nicht angefasst.

## 1. Screencast-Stile als "Nur Vorlage"

- `src/features/whiteboard/styles.ts`: Feld `nichtGenerierbarGrund?: string` im Interface ergänzen.
- `screencast` und `screencast_plus`: `generierbar: false` plus Grund "Braucht eine Bildschirmaufnahme deiner Software. Die KI kann nur Standbilder erzeugen, keine echte Oberfläche."
- `mixed_media` und `live_action`: bestehenden Satz als `nichtGenerierbarGrund` hinterlegen.
- `STYLE_RECOMMENDATIONS`, Zeile "Software bedienen": warum ergänzen um "Aufnahme selbst erstellen, die Vertonung übernimmt das Tool."
- `src/pages/admin/StyleLibrary.tsx`: fest verdrahteten Hinweis durch `nichtGenerierbarGrund` ersetzen, alter Satz als Fallback.
- Die Stilauswahl im Editor filtert bereits auf `generierbar`, dadurch verschwinden beide Screencast-Stile dort automatisch.

## 2. Preisstand sichtbar machen

In `src/components/admin/KieModelPricing.tsx` pro Modell zusätzlich anzeigen:
- "zuletzt geprüft: <Datum>" wenn `last_checked_at` gesetzt ist,
- sonst ein Badge "Preis nie abgeglichen".

Keine Änderung an Preiswerten in der Datenbank.

## 3. Kosten für den Zusatz-Videoclip

Im Editor (`src/pages/admin/WhiteboardVideoEditor.tsx`):
- Neues Feld "Cliplänge in Sekunden" (Zahl, 2–10, Vorgabe 4) neben dem Button "Zusätzlichen KI-Videoclip erzeugen"; ersetzt die feste Konstante von 8 Sekunden.
- Bestätigungsdialog (AlertDialog) vor dem Erzeugen mit Modellname, Sekunden, Credits pro Sekunde, Gesamtkosten und verfügbarem Guthaben.
- Reichen die Credits nicht, ist der Bestätigungsknopf deaktiviert und zeigt, wie viele Credits fehlen.
- Die Kostenübersicht rechnet die Zeile "KI-Videoclip" mit, sobald eine Cliplänge gesetzt ist (`videoSeconds` in der Gesamtschätzung).

## Prüfung danach

- Stilbibliothek zeigt vier Stile als "Nur Vorlage" mit jeweils passendem Grund.
- Editor-Stilauswahl listet die beiden Screencast-Stile nicht mehr.
- Videoclip-Dialog rechnet Sekunden × Preis korrekt und blockiert bei zu wenig Guthaben.
- Typprüfung läuft durch.
