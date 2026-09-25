# Leistungsangebot als durchgängigen KI-Lernprozess ausrichten

## Zielbild
one-next präsentiert seine Angebote nicht mehr als vier gleichrangige Einzelleistungen, sondern als zusammenhängenden Weg:

1. **Das richtige Problem klären** – Problem Framing
2. **Eine Lösung klein testen** – moderierter oder selbstgeführter KI Design Sprint
3. **Einen sicheren KI-Arbeitsablauf entwickeln** – individuelle KI-Entwicklung mit klaren Rollen, Datenregeln und menschlicher Freigabe
4. **Wirkung messen, verbessern und skalieren** – reale Ergebnisse auswerten, Vorgehen anpassen und tragfähige Lösungen ausbauen

**KI-Beratung** begleitet den gesamten Weg bei Orientierung, Priorisierung, Governance und Veränderung. Das **Datenqualitäts-Audit** wird dort eingebunden, wo Daten die Verlässlichkeit eines Tests oder einer Umsetzung bestimmen. Beide werden nicht als obligatorische lineare Schritte dargestellt.

## Umsetzung

### 1. Gemeinsame Prozessdarstellung schaffen
- Eine zentrale, wiederverwendbare Prozessdefinition für Reihenfolge, Titel, Kurztexte, Ergebnisse, Links und begleitende Leistungen anlegen.
- Den Prozess auf der Startseite als führende Leistungsdarstellung aufbauen und die bisherige widersprüchliche Vier-Karten-Abfolge ersetzen.
- Jede Phase zeigt klar: Ausgangsfrage, Leistung von one-next, konkretes Ergebnis und sinnvoller nächster Schritt.
- Moderierte und selbstgeführte Sprint-Angebote bleiben als zwei Wege innerhalb derselben zweiten Phase erhalten.

### 2. Das KMU-Beispiel als roten Faden einsetzen
- Das Beispiel eines Betriebs mit 45 Mitarbeitenden und fünf Tagen Bearbeitungszeit klar als erfunden kennzeichnen.
- Durch alle vier Phasen weiterführen:
  - unnötige Wartezeit und fachliche Preisentscheidung trennen,
  - einen Assistenten für freigegebene Produktinformationen testen,
  - Entwurf, Prüfung und Freigabe als sicheren Arbeitsablauf gestalten,
  - nach vier Wochen Bearbeitungszeit, Fehler, Nacharbeit und Rückfragen vergleichen.
- Keine Erfolgswerte erfinden: Das Ziel der Halbierung bleibt Zielsetzung, nicht behauptetes Ergebnis.

### 3. Navigation und Sprintübersicht neu ordnen
- Das Leistungsmenü in Prozessreihenfolge strukturieren: Problem Framing, KI Design Sprint, individuelle KI-Entwicklung.
- KI-Beratung und Datenqualitäts-Audit sichtbar als begleitende Bausteine absetzen.
- Datenbankgesteuerte Navigation und feste Ausweichnavigation identisch halten; Rollen- und Kontolinks unverändert lassen.
- Die Sprintübersicht als Entscheidungspunkt innerhalb der zweiten Phase weiterführen: unklare Challenge → Problem Framing, klare Challenge → Design Sprint, flexibel → Online-Variante.

### 4. Alle Leistungsseiten konsistent einordnen
- Auf Problem Framing, Design Sprint, Online Sprint, individueller KI-Entwicklung, KI-Beratung und Datenqualitäts-Audit jeweils eine kompakte Einordnung in den Gesamtprozess ergänzen.
- Problem Framing endet sichtbar mit der Übergabe in den Design Sprint.
- Design Sprint und Online Sprint führen von einem getesteten Lösungsansatz in einen begrenzten, sicheren KI-Test beziehungsweise die individuelle Entwicklung.
- Individuelle KI-Entwicklung verbindet BMAD-Planung mit Arbeitsablauf, Verantwortlichkeiten, menschlicher Freigabe und messbarer Erprobung.
- KI-Beratung als Begleitung vor, während oder nach den Kernphasen formulieren.
- Datenqualitäts-Audit als bedarfsabhängige Grundlage vor einem datenabhängigen Test oder während der Umsetzung einordnen.
- Bestehende Leistungsumfänge, Workshop-Dauern, Preise, Buchungswege und Funktionen unverändert lassen; nur nachweislich widersprüchliche Bezeichnungen werden vereinheitlicht.

### 5. Sprache, Schlussstrecken und Auffindbarkeit angleichen
- Prozessbegriffe, Überschriften, Handlungsaufforderungen und Ergebnisformulierungen seitenübergreifend vereinheitlichen.
- Denglisch reduzieren und konsequent „KI“, Satzschreibweise sowie die vorhandene one-next-Tonalität verwenden.
- Jede Seite erhält passende Vorher-/Nachher-Verweise, ohne einen starren Pflichtpfad vorzutäuschen.
- Seitentitel, Beschreibungen, strukturierte Daten und `llms.txt` an die neue Einordnung anpassen; bestehende Seitenadressen bleiben erhalten.

### 6. Qualitätssicherung
- Alle Prozesslinks, Menüpunkte, Buchungsdialoge und Online-Startwege prüfen.
- Desktop-, Tablet- und Smartphone-Darstellung kontrollieren, besonders Prozessfolge, Beispieltexte und Leistungsmenü.
- Tastaturbedienung, Fokuszustände, Kontrast und Textumbrüche prüfen.
- Typprüfung, Linter, App-Start und Browserprüfung ohne Konsolenfehler durchführen.
- Abschließend den vollständigen Diff zeigen.

## Technische Hinweise
- Die Prozessinhalte werden zentral typisiert und von Startseite sowie den kompakten Prozesseinordnungen der Leistungsseiten wiederverwendet, damit Reihenfolge und Begriffe nicht erneut auseinanderlaufen.
- Die bestehende CMS-Bearbeitung individueller Seitentexte bleibt erhalten; die gemeinsame Prozesslogik wird nicht von veralteten Einzeltexten überschrieben.
- Für die datenbankgesteuerte Navigation wird eine gezielte Migration mit aktualisierter Reihenfolge und Gruppierung erstellt; keine Änderungen an Rollen, Anmeldung oder anderen Backend-Daten.
- Bestehende Designtokens, Bilder, Schriften und Komponenten bleiben die visuelle Grundlage.
