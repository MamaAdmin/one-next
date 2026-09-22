# Design-Sprint-Workshop an die Struktur des Problem-Framing-Workshops anpassen

## Ziel
Der KI-unterstützte Design Sprint erhält dieselbe ruhige Seitenstruktur, Hierarchie und Abschnittsdramaturgie wie der Problem-Framing-Workshop. Die bereits geschärften Inhalte, Rollen, Agenda und KI-Aussagen bleiben erhalten.

## Neue Seitenstruktur

### 1. Gemeinsamer Seiteneinstieg
- Bestehenden gemeinsamen Einstieg unverändert weiterverwenden.
- Wie bei Problem Framing in einen durchgehenden Hauptbereich mit identischem oberen Abstand einbetten.

### 2. Ausgangslage und Ziel
- Den bisherigen Bereich „Zweck & Ergebnis“ wie bei Problem Framing aufbauen:
  - kleine Kennzeile
  - linkbündige Hauptüberschrift
  - zwei offene Spalten mit senkrechten Linien statt Karten
- Darunter drei kompakte Ausgangslagen im gleichen Kartenraster wie bei Problem Framing, abgeleitet aus vorhandenen Design-Sprint-Inhalten: klare Challenge, Entscheidung über Lösungsrichtung, Bedarf an schnellem Prototyp und Test.

### 3. Team und Rollen
- Exakt das zweispaltige Muster von Problem Framing übernehmen:
  - links eine feststehende Einordnung mit Personenzahl
  - rechts die sechs Rollen als ruhige Liste mit Trennlinien
- Rollen und Beschreibungen inhaltlich unverändert lassen.

### 4. Moderierter Ablauf
- Die modulare Agenda für 1–4 Tage an die klare Ablaufdarstellung von Problem Framing angleichen.
- Überschrift und Einleitung mittig setzen.
- Vier Tage auf Desktop als strukturierte Schritte mit Nummer, Symbol, Titel und Beschreibung darstellen; auf kleinen Bildschirmen als aufklappbare Liste.
- Die vier möglichen Formate von 1 bis 4 Tagen als eingerahmten Block „Passender Umfang“ voranstellen.
- „Definition of Done“ im gleichen hervorgehobenen Abschlussformat wie bei Problem Framing darstellen.

### 5. Arbeitsweise
- „Was können Sie erwarten?“, „Warum ein KI-unterstützter Design Sprint?“ und „Vorlagen & Methoden“ zu einem konzentrierten Abschnitt zusammenführen.
- Aufbau wie „Moderation statt starrer Vorlagen“ bei Problem Framing:
  - links Erklärung, wie Moderation und KI zusammenspielen
  - rechts vier klare Punkte: Moderation und Timeboxes, ChatGPT und Claude, schnelles Prototyping, Entscheidungen durch das Team
- Aussage beibehalten, dass KI Vorschläge liefert und beschleunigt, das Team aber bewertet und entscheidet.

### 6. Ihr Ergebnis
- „Was Sie am Ende haben“ wie den Ergebnisbereich von Problem Framing gestalten:
  - links Einordnung und Hauptaussage
  - rechts Ergebnisliste mit Trennlinien statt drei Karten
- Priorisierter Lösungsansatz, passender Reifegrad, Machbarkeit, dokumentierte Erkenntnisse und nächste Schritte übernehmen.

### 7. Abschluss der Seite
- Gemeinsame Workshop-Vergleichs- und Orientierungsbereiche in derselben Reihenfolge wie bei Problem Framing anzeigen.
- Schlussbereich ohne innere Karte als breite, ruhige Abschlussfläche gestalten.
- Bestehende Wege „Workshop anfragen“ und „Online Sprint“ erhalten.

## Technische Details
- `DesignSprintWorkshop.tsx` strukturell an `ProblemFramingWorkshop.tsx` ausrichten.
- Für die mobile Agenda dieselben bestehenden Akkordeon-Bausteine verwenden.
- Nicht mehr benötigte Kartenblöcke und Symbolimporte entfernen.
- Gemeinsame Schriften, semantische Farben, dünne Rahmen und eckige Schaltflächen beibehalten.
- Abschließend Typprüfung und Sichtprüfung auf Desktop und Smartphone.
