# Custom AI Development als nächsten Umsetzungsschritt überarbeiten

## Ziel
Die Seite „Individuelle KI-Entwicklung“ wird als klare Fortsetzung von Problem Framing und KI-unterstütztem Design Sprint aufgebaut. Sie zeigt verständlich, wie deren Ergebnisse in einen High-Level-Plan nach BMAD überführt, gemeinsam geprüft und für die weitere Umsetzung in Jira und Confluence Cloud strukturiert werden.

## Seitenaufbau

1. **Seiteneinstieg schärfen**
   - Titel und Unterzeile stellen sofort klar: Nach Problem Framing und Design Sprint folgt die BMAD-Integration.
   - Die Einleitung erklärt knapp, dass vorhandene Workshop-Ergebnisse nicht neu begonnen, sondern in einen umsetzbaren High-Level-Plan überführt werden.
   - Bestehendes Bildformat, Schrift, feine hellblaue Rahmen und Buchungsweg bleiben im Stil der beiden Workshop-Seiten erhalten.
   - Die vorhandenen bearbeitbaren Textfelder für die Redaktion bleiben funktionsfähig.

2. **Ausgangslage und Ziel wie bei den Workshop-Seiten**
   - Zwei offene Spalten für „Zweck“ und „Ergebnis“ statt schwerer Karten.
   - Zweck: Ergebnisse aus Problem Framing und Design Sprint zu einem gemeinsamen technischen und fachlichen Zielbild verbinden.
   - Ergebnis: ein verständlicher High-Level-Plan für die zukünftige KI-Lösung, ihre Architektur, Verantwortlichkeiten und Umsetzungsschritte.

3. **Den Übergang als zusammenhängenden Prozess zeigen**
   - Drei klar nummerierte Schritte im vertrauten Seitenmuster:
     1. Problem Framing schafft Challenge, Scope und Erfolgskriterien.
     2. Design Sprint liefert priorisierten Lösungsansatz, Prototyp und Erkenntnisse.
     3. BMAD überführt diese Ergebnisse in einen umsetzbaren Plan.
   - Die ersten beiden Schritte verlinken direkt auf die passenden Workshop-Seiten.

4. **BMAD-Modelle strukturiert darstellen**
   - Die vorhandenen sieben Bausteine bleiben erhalten und werden als ruhige, nummerierte Abfolge statt als uneinheitliches Kartenraster dargestellt:
     - Business Alignment
     - Use Case Definition
     - Datenanforderungen
     - KI Solution Design
     - Architektur-Blueprint
     - Rollen und Verantwortlichkeiten
     - Roadmap und Milestones
   - Jeder Baustein erklärt kurz seinen Beitrag zum High-Level-Plan.
   - Abschluss als „Definition of Done“: abgestimmter Plan mit klaren Entscheidungen, Abhängigkeiten und nächsten Schritten.

5. **Gemeinsame Ausarbeitung und Übergabe**
   - Eigener Abschnitt erklärt, dass one-next die Workshop-Ergebnisse gemeinsam mit dem Kundenteam prüft, ergänzt und priorisiert.
   - Jira und Confluence Cloud werden als Ziel für die strukturierte Dokumentation und Arbeitsplanung genannt.
   - Da im aktuellen Projekt keine technische Jira-/Confluence-Anbindung vorhanden ist, beschreibt die Seite die Leistung als strukturierte Überführung und Integration, ohne eine bereits automatisierte Synchronisation zu behaupten.

6. **Ergebnisse und nächster Schritt**
   - Die bestehenden Vorteile werden in die offene Ergebnisliste der Workshop-Seiten überführt.
   - Der aktuelle missverständliche Abschnitt „Externe Umsetzung“ wird durch eine klare Perspektive auf den nächsten Umsetzungsschritt ersetzt.
   - Abschlussfläche im gleichen ruhigen Aufbau wie Problem Framing und Design Sprint, mit bestehendem Termin-Dialog.

## Gestaltung
- Aufbau, Abstände, Typografie und Bildgrösse folgen Problem Framing und Design Sprint.
- Cream & Slate, semantische Farbtokens, dezente Linienicons und dünne hellblaue Rahmen.
- Keine farbigen oder schimmernden Icons, keine schweren Karten und keine dekorativen Hintergrundblasen.
- Desktop und Smartphone erhalten denselben klaren Lesefluss; längere BMAD-Schritte werden mobil platzsparend aufklappbar.

## Technische Umsetzung
- `src/pages/CustomAIDevelopment.tsx` in die gemeinsame Seitenstruktur mit `ServicePageHero` und den bestehenden Designmustern überführen.
- Bestehende Inhaltsbearbeitung über `usePageContent`, `InlineTextField` und `InlineTextArea` erhalten.
- Seitentitel, Beschreibung und strukturierte Servicedaten auf den Ablauf Problem Framing → Design Sprint → BMAD-Integration abstimmen.
- Keine Änderung am BMAD-Portal, an Datenbankstrukturen oder an Workshop-Funktionen.
- Abschliessend Typprüfung sowie Sichtprüfung auf Desktop und Smartphone, inklusive Links und Inhaltsbearbeitung.
