## Plan: KI-Antworten zuverlässig übernehmen

Ich behebe die Übernahme zentral in `SprintStepCard`, damit sie für alle Sprint-Phasen und Varianten gilt, die KI-Vorschläge nutzen.

### 1. Übernahme-Logik robust machen
- `acceptVorschlag` so anpassen, dass KI-Vorschläge sofort sauber in `eigene` übernommen und aus `vorschlaege` entfernt werden.
- Duplikate weiterhin verhindern, aber ohne veraltete React-State-Werte.
- `Alle übernehmen` nicht mehr über mehrfaches `setState` in einer Schleife ausführen, sondern als eine atomare Übernahme aller Vorschläge.

### 2. Speichern beim schnellen Weiterklicken absichern
- Das Problem entsteht vermutlich, wenn direkt nach „Übernehmen“ auf „Weiter“ geklickt wird: React-State ist dann noch nicht sicher aktualisiert.
- Ich passe die Persistenz so an, dass immer der aktuell berechnete Stand gespeichert wird.
- Optional: Nach Einzel-/Alle-Übernahme direkt zwischenspeichern, damit Vorschläge auch beim Phasenwechsel erhalten bleiben.

### 3. Auswahl und Ranking konsistent halten
- Übernommene KI-Antworten sollen danach in der Optionenliste für Auswahl/Ranking erscheinen.
- Wenn ein übernommener Vorschlag entfernt wird, darf er nicht versehentlich aus User-Antworten gelöscht werden.

### 4. End-to-end prüfen
- Einen Sprint-Schritt mit KI-Vorschlägen testen: generieren → übernehmen → weiter → zurück → Daten noch vorhanden.
- Zusätzlich einen späteren Schritt/Phase testen, damit der Fix nicht nur Tag 1 betrifft.