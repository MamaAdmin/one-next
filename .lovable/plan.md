# Sprintübersicht als klare Entscheidungshilfe neu strukturieren

## Ziel
Die Sprintübersicht erklärt verständlich, wie Problem Framing, moderierter KI Design Sprint und Online Design Sprint zusammenhängen. Besucher:innen sollen schnell erkennen, welcher Weg zu ihrer Situation passt, und direkt zur richtigen Angebotsseite gelangen.

## Seitenstruktur

### 1. Seiteneinstieg als Übersicht
- Den bestehenden gemeinsamen Seiteneinstieg im Stil der beiden Workshop-Seiten beibehalten.
- Titel und Einleitung so schärfen, dass die Seite als Orientierung für drei modulare Wege erkennbar ist.
- Vorhandene Bearbeitbarkeit der Einstiegstexte erhalten.

### 2. Drei Angebote auf einen Blick
- Die bestehenden drei Angebote in das ruhige Raster von Problem Framing und Design Sprint übertragen: dünne Linien, klare Überschriften, wenige gezielte Symbole, keine schweren Aktionsflächen.
- Pro Angebot eindeutig zeigen:
  - wann es passt,
  - was enthalten ist,
  - welches Ergebnis entsteht,
  - ob es moderiert oder selbstgeführt ist.
- Direkte Zielseiten:
  - Problem Framing → `/problem-framing-workshop`
  - KI-unterstützter Design Sprint → `/design-sprint-workshop`
  - Online Design Sprint → `/sprint-uebersicht/online`

### 3. Übergang vom Problem Framing zum Design Sprint
- Den bisherigen Abschnitt „Was ist ein KI Design Sprint Workshop?“ durch einen klaren Prozessabschnitt ersetzen.
- Den Zusammenhang erklären:
  1. Eine noch unklare Challenge wird zuerst im Problem Framing geschärft.
  2. Das Ergebnis wird als Briefing in den Design Sprint übernommen.
  3. Im Design Sprint entsteht daraus ein priorisierter und getesteter Lösungsansatz.
- Die Darstellung folgt der nummerierten, offenen Schrittdarstellung der beiden Workshop-Seiten.

### 4. Online Design Sprint als modulares System
- Einen eigenen, deutlich abgegrenzten Abschnitt ergänzen.
- Erklären, dass der Online Design Sprint selbstgeführt und modular zusammengestellt wird.
- Sichtbar machen, dass wahlweise enthalten sein können:
  - ein nicht moderiertes Problem Framing,
  - der eigentliche Design-Sprint-Prozess,
  - oder beide Module als durchgängiger Weg.
- Klarstellen, dass Umfang und Module selbst gewählt werden können.
- Zur Detailseite des Online Design Sprints führen; der eigentliche Start bleibt dort verortet.

### 5. Entscheidungshilfe
- Eine einfache Auswahl nach Ausgangslage aufbauen:
  - „Meine Challenge ist noch unklar“ → Problem-Framing-Workshop
  - „Meine Challenge ist klar und wir möchten moderiert arbeiten“ → KI-unterstützter Design Sprint
  - „Wir möchten flexibel und selbstgeführt arbeiten“ → Online Design Sprint
- Jede Auswahl erhält eine kurze Begründung, das erwartete Ergebnis und einen eindeutigen Link.
- Auf kleinen Bildschirmen untereinander, auf Desktop als gut vergleichbare drei Spalten.

### 6. Ergebnis und Abschluss
- Wiederholende Bereiche wie die alte Kurzagenda, allgemeine Vorteilskarten und den doppelten Workshop-Aufruf entfernen oder in die Entscheidungshilfe integrieren.
- Schlussbereich wie auf den beiden Workshop-Seiten als breite, ruhige Fläche ohne innere Karte gestalten.
- Zwei Wege anbieten: direkt ein Angebot auswählen oder ein Beratungsgespräch vereinbaren.

## Inhaltliche Aktualisierungen
- Durchgängig „KI“ statt „AI“ verwenden.
- Veraltete feste Aussagen wie „2-Tage-Workshop“ auf den aktuellen modularen Umfang von 1–4 Tagen abstimmen.
- Metadaten und strukturierte Fragen an die neue Rolle als Sprintübersicht und Entscheidungshilfe anpassen.
- Keine Preise oder neuen Leistungsversprechen ergänzen.

## Technische Details
- Hauptanpassung in `src/pages/AIDesignSprint.tsx`.
- Bestehende Inhaltsbearbeitung für die aktuell bearbeitbaren Texte erhalten.
- Gemeinsame Schriften, semantische Cream-&-Slate-Farben, dünne hellblaue Rahmen und eckige Schaltflächen verwenden.
- Keine Änderungen an den drei Produktseiten oder deren Abläufen.
- Abschließend Typprüfung sowie Sicht- und Linkprüfung auf Desktop und Smartphone.
