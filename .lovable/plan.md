# Einheitliches Dashboard-Design für CMS, LMS, BMAD und Design Sprints

## Ziel
Alle Dashboard- und Übersichtsseiten der vier Bereiche erhalten denselben visuellen Aufbau wie die bestehende Admin-Navigation: ruhige Cream-&-Slate-Flächen, einheitliche Breadcrumbs, klare Überschriften, konsistente Aktionen, Filter, Karten und Listen. Bestehende Funktionen und Berechtigungen bleiben unverändert.

## Umsetzung

### 1. Gemeinsames Dashboard-Grundlayout
- Einen wiederverwendbaren Seitenkopf für Breadcrumb, Titel, Beschreibung und primäre Aktion erstellen.
- Einheitliche Inhaltsbreite, Abstände unter der festen Navigation und responsive Seitenränder festlegen.
- Ladezustände, leere Ansichten und Abschnittsüberschriften angleichen.

### 2. Gemeinsame Darstellung für Übersichtsinhalte
- Kennzahlen, Bereichsauswahl, Filterleisten, Tabellen und Karten auf dieselben Abstände, Rahmen und Typografie bringen.
- Aktionen wie „Neu“, „Bearbeiten“, „Löschen“ und „Öffnen“ an konsistente Positionen setzen.
- Lange Titel und Beschreibungen auf kleinen Bildschirmen sauber umbrechen oder kürzen.
- Vorhandene Design-Tokens und bestehende Schaltflächen-Komponenten verwenden.

### 3. CMS und zentrales Admin-Dashboard
- Das Admin-Dashboard mit seinen Bereichen CMS, LMS, BMAD und Sprints auf das gemeinsame Grundlayout umstellen.
- CMS-Auswahl und eingebettete Verwaltungsansichten visuell vereinheitlichen.
- Die vorhandene Tab-Struktur und alle CMS-Funktionen beibehalten.

### 4. LMS-Dashboards
- Kunden, Kurse, Module, Toolbox, Käufe, Teilnahmen, Teilnehmer, offene Kurse und Analytik angleichen.
- Unterschiedliche Kopfbereiche, Filterkarten und Tabellencontainer durch das gemeinsame Muster ersetzen.
- Mobile Karten- und Tabellenansichten konsistent gestalten.

### 5. BMAD-Dashboards
- Admin-Übersichten für Sessions, Artefakte und Analytik vereinheitlichen.
- Das BMAD-Benutzer-Dashboard an die globale Navigation, Breadcrumb-Leiste und denselben Seitenkopf anbinden.
- Session-Karten und leere Zustände an das gemeinsame Kartendesign anpassen.

### 6. Design-Sprint-Dashboards
- Die Sprint-Übersicht und die Sprint-Verwaltung im Admin-Bereich optisch angleichen.
- Problem-Framing-/Sprint-Paare, Statusanzeigen und Aktionen in das gemeinsame Raster einordnen.
- Arbeitsseiten wie Framing, Kickoff und eigentlicher Sprint behalten ihren aufgabenbezogenen Aufbau; nur Navigation und Seitenrahmen bleiben dort konsistent.

### 7. Prüfung
- Alle Breadcrumb-Ziele und Hauptaktionen anklicken und kontrollieren.
- CMS, LMS, BMAD und Sprints auf Desktop, Tablet und Mobilgerät prüfen.
- Sicherstellen, dass keine Inhalte überlappen und bestehende Funktionen unverändert arbeiten.

## Technische Details
- Wiederverwendbare Layout-Bausteine unter den vorhandenen Admin-Komponenten ergänzen.
- Ausschließlich semantische Farben und Abstände aus dem bestehenden Designsystem verwenden.
- Keine Änderungen an Datenbank, Rollen, Berechtigungen oder fachlicher Logik.
