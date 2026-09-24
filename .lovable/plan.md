# Bildvorgabe aus Referenzbild erstellen

## Ziel
Im Whiteboard-Briefing kann Gemini das hochgeladene Referenzbild analysieren und daraus automatisch eine wiederverwendbare Bildvorgabe erstellen.

## Umsetzung
1. Neben der Referenzbild-Vorschau erscheint **„Bildvorgabe mit KI erstellen“**.
2. Die private Bilddatei wird serverseitig geladen und an die bestehende Gemini-Anbindung übergeben.
3. Gemini beschreibt ausschliesslich übertragbare visuelle Merkmale: Farbwelt, Figurenstil, Perspektive, Licht, Formen, Linien, Materialien und Stimmung. Bildinhalt, Namen, Logos und sichtbare Texte werden nicht als feste Vorgabe übernommen.
4. Das Ergebnis wird in das vorhandene Feld **„Bildvorgabe“** geschrieben. Ein vorhandener Text wird erst nach Bestätigung ersetzt.
5. Ladezustand sowie klare Fehlermeldungen werden angezeigt; das Ergebnis bleibt vor dem Speichern editierbar.
6. Die Funktion wird veröffentlicht und mit einem Referenzbild geprüft.

## Technische Details
- Erweiterung der bestehenden Gemini-Hilfsfunktion um Bildinhalte mit korrektem Dateityp.
- Neue geschützte Aktion in der Skriptfunktion; Zugriff bleibt auf Administratoren begrenzt.
- Keine Lovable-Credits: Die Analyse nutzt wie die bestehende Skripterzeugung das eigene Gemini-Konto.
