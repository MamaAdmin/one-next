# Plan: „Was ist BMAD?"-Abschnitt auf der Seite Individuelle KI-Entwicklung ergänzen

## Ziel
Einen neuen Abschnitt ergänzen, der erklärt, was BMAD ist, was ein BMAD-Blueprint enthält und welchen Zweck er erfüllt — orientiert am mitgelieferten Text, überführt in die bestehende Cream-&-Slate-Gestaltung der Seite.

## Platzierung
Neuer Abschnitt zwischen dem Prozess-Schritte-Abschnitt („Drei Schritte von der Challenge zur Umsetzung") und dem BMAD-Module-Abschnitt („Vom Business Alignment zur Roadmap"). So versteht die Leserschaft zuerst den Ablauf, dann was BMAD ist, und sieht anschliessend die sieben Bausteine.

## Aufbau des neuen Abschnitts
- Kleine Kennzeile: „Was ist BMAD?"
- Überschrift: „Eine Methode für umsetzungsreife KI-Planung"
- Einleitung: BMAD (Breakthrough Method of Agile AI-Driven Development) ist eine strukturierte Methode, die fachliche und technische Anforderungen zu einem vollständigen Spezifikations-Paket verbindet.
- Drei Blueprint-Bestandteile als ruhige Liste mit Trennlinien (keine Karten):
  1. **Product Requirements Document (PRD):** Präzise Beschreibung aller Anforderungen und Systemgrenzen.
  2. **Architektur-Spezifikation:** Technische Struktur, Datenflüsse, API-Anbindungen und Auswahl der passenden KI-Modelle.
  3. **User Stories & Epics:** In kleine, testbare Häppchen zerlegte Aufgabenpakete für die Entwicklung.
- Zweck-Block (hervorgehoben mit linkem Rand wie Definition of Done): Der fertige Blueprint ist ein umsetzungsreifes Lastenheft. Er ist so detailliert, dass er direkt an externe Softwareentwickler oder an KI-Entwicklungs-Agenten wie Claude Code oder Cursor übergeben werden kann. Dadurch werden Missverständnisse, Fehler und unnötige Entwicklungsschleifen minimiert.

## Gestaltungsregeln (bestehend)
- `font-workshop` / `font-workshop-heading`, semantische Cream-&-Slate-Tokens, keine festen Farbwerte.
- Kleine Kennzeile `text-sm font-bold uppercase text-primary` über jeder Überschrift.
- Trennlinien `border-border` / `border-border-accent`, keine schweren Karten.
- Hervorgehobener Zweck-Block im selben Stil wie die bestehende „Definition of Done"-Box (`border-l-4 border-primary bg-accent-soft p-6`).
- Responsive: Desktop zwei Spalten (Bestandteile links, Zweck rechts oder untereinander), Mobile gestapelt.
- Durchgängig „KI" statt „AI" (Ausnahme: Claude Code, Cursor als Produktnamen bleiben).

## Technische Umsetzung
- Datei: `src/pages/CustomAIDevelopment.tsx`
- Neuer `<section>` zwischen dem Prozess-Schritte-Abschluss (`</section>` Zeile ~215) und dem BMAD-Module-Abschnitt (`<section>` Zeile ~217).
- Keine neuen Imports nötig (Icons `FileText`, `Layers`, `FileCheck2` bereits vorhanden; `GitBranch` als Symbol für den Zweck-Block ebenfalls vorhanden).
- Keine Änderung an bestehenden Inhalten, SEO, Buchungswegen oder anderen Abschnitten.

## Abschluss
- `npx tsgo --noEmit` prüfen.
- Playwright-Sichtprüfung Desktop + Mobile auf `/custom-ai-development`.
