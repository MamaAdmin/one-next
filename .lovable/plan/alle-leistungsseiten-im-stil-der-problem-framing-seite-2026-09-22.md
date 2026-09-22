# Alle Leistungsseiten im Stil der Problem-Framing-Seite

Die Problem-Framing-Seite wird zur Vorlage. Alle übrigen Leistungsseiten bekommen denselben Aufbau, dieselbe Schrift und vor allem dasselbe Einstiegsbild-Format (ruhiges Bild rechts neben dem Text, gleiches Seitenverhältnis, feiner versetzter Rahmen).

## Seiten, die angeglichen werden

- Design Sprint Workshop
- Individuelle KI-Entwicklung
- KI-Beratung
- Innovationssprint (Sprint-Übersicht) und die Online-Sprint-Seite
- Datenqualitäts-Audit
- Abschnitt „Unsere Leistungen" auf der Startseite (Überschriften, Karten und Abstände im gleichen Stil)

Die Problem-Framing-Seite selbst bleibt inhaltlich unverändert.

## Einheitlicher Seiteneinstieg

Jede Seite erhält oben:

- kleines Kennzeichen („Der Startpunkt", „Nächster Schritt" usw.) – vorhandene Formulierungen bleiben
- Überschrift mit ruhigem Zweitzeilen-Zusatz
- vorhandener Einleitungstext
- die vorhandenen beiden Schaltflächen, eckig mit dünnem hellblauen Rahmen
- eine schmale Kennzahlenzeile (Dauer / Teilnehmende / Ergebnis), nur mit bereits auf der Seite vorhandenen Angaben
- Bild rechts im gleichen Format wie bei Problem Framing

## Bilder

- Design Sprint Workshop, Problem Framing und Datenqualitäts-Audit nutzen die vorhandenen Fotos.
- Für KI-Beratung, KI-Entwicklung, Innovationssprint und Online-Sprint werden neue Bilder im gleichen ruhigen, hellen Workshop-Stil erzeugt und in der Seite eingebunden.

## Einheitlicher Seitenrhythmus

- gleiche Abschnittsabstände und Wechsel heller Flächen wie bei Problem Framing
- gleiche Überschriftenhierarchie mit kleiner Kennzeile über jeder Überschrift
- Schlussbereich als heller Abschnitt mit dünnem blauen Rahmen und den bestehenden Buchungswegen
- keine neuen Inhalte, Kennzahlen oder Zitate; bestehende Texte, Links und Buchungsdialoge bleiben

## Technische Hinweise

- Gemeinsame Bausteine `ServicePageHero` und `ServiceSection` unter `src/components/service/`, damit alle Seiten identisch bleiben; Problem Framing wird als Referenz darauf umgestellt.
- Schriften `font-workshop` (Manrope) und `font-workshop-heading` (Sora) auf allen genannten Seiten.
- Nur semantische Cream-&-Slate-Tokens, keine festen Farbwerte; Buttons bleiben eckig mit `border-border-accent`.
- Inline-Edit-Felder (`InlineTextField`, `InlineTextArea`) auf KI-Beratung, KI-Entwicklung und Sprint-Übersicht bleiben funktionsfähig.
- Bestehende SEO-Daten (`SEO`, strukturierte Daten) bleiben unverändert.
- Neue Bilder als `src/assets/*.jpg`, per ES6-Import eingebunden.
- Abschluss: `npx tsgo --noEmit` sowie Sichtprüfung aller Seiten auf Desktop und Smartphone.
