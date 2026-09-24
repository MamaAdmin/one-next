# Eigene Bildvorgabe im Video-Briefing

## Ziel
Im Briefing entsteht ein neuer Bereich **„Bildvorgabe“**, in dem festgelegt wird, wie alle Bilder des Videos aussehen sollen. Dafür stehen Freitext und ein Referenzbild gemeinsam zur Verfügung.

## Umsetzung
1. **Freitext für die Bildgestaltung**
   - Mehrzeiliges Feld für Farben, Personen, Kleidung, Perspektive, Umgebung, Stimmung und weitere wiederkehrende Merkmale.
   - Beispielhinweis im Feld, ohne die bestehende Videostil-Auswahl zu ersetzen.
   - Die Vorgabe wird pro Video gespeichert und beim erneuten Öffnen wieder geladen.

2. **Referenzbild hochladen**
   - JPG, PNG oder WebP mit Dateiprüfung und klarer Grössenbegrenzung.
   - Vorschau direkt im Briefing sowie Aktionen zum Ersetzen und Entfernen.
   - Private Speicherung im bereits geschützten Whiteboard-Bereich; für die Anzeige und Bilderzeugung wird jeweils eine zeitlich begrenzte Adresse erstellt.

3. **Vorgabe konsequent anwenden**
   - Beim Erstellen des Skripts fliesst die Freitext-Vorgabe in die Bildbeschreibungen der Abschnitte ein.
   - Bei „Alle Zeichnungen erzeugen“ und beim Neuerstellen einer einzelnen Zeichnung wird die Vorgabe an das gewählte Bildmodell übergeben.
   - Das hochgeladene Referenzbild hat Vorrang als Stilreferenz. Ohne eigenes Referenzbild bleibt die heutige Logik erhalten, bei der das erste erzeugte Bild den Look der weiteren Bilder stabilisiert.
   - Der ausgewählte Videostil bleibt als Grundstil bestehen; die eigene Bildvorgabe verfeinert ihn.

4. **Speicherung und Kompatibilität**
   - Ergänzung der Videodaten um Bildvorgabe und sicheren Speicherpfad des Referenzbildes.
   - Bestehende Videos funktionieren unverändert und erhalten leere Standardwerte.
   - Beim Entfernen oder Ersetzen wird die alte Referenzdatei sauber gelöscht.

5. **Prüfung**
   - Speichern und erneutes Laden von Text und Referenzbild testen.
   - Gesamterzeugung sowie Neuerzeugung eines einzelnen Bildes prüfen.
   - Darstellung und Bedienung auf Desktop und Smartphone kontrollieren.

## Technische Details
- Die bestehenden Admin-Berechtigungen und der private Upload-Speicher werden weiterverwendet.
- Die Skriptfunktion erhält die Bildvorgabe als zusätzlichen Parameter.
- Die Bilderzeugung erhält sowohl die ergänzende Vorgabe als auch die signierte Referenzbild-Adresse.
- Bestehende Stil-, Kosten- und Videoeinstellungen bleiben unverändert.
