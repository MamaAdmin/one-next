# KI-Beratung im Stil von Problem Framing und Design Sprint

Die Seite "KI Consulting Services" bekommt denselben ruhigen Aufbau wie die beiden Workshop-Seiten. Inhaltlich bleiben Beratungsansatz, Beratungsleistungen sowie Branchen und Use Cases erhalten – sie werden nur sprachlich und gestalterisch an die anderen Seiten angeglichen.

## Neue Kernaussage

Deutlich wird künftig: Julia Haitz berät persönlich – und wenn ein Thema tiefe Spezialkenntnisse braucht, wird es an geprüfte Expertinnen und Experten aus dem Netzwerk weitergegeben. Diese Aussage erscheint im Einstieg und als eigener kurzer Abschnitt "Persönliche Beratung und Netzwerk".

## Seitenaufbau (wie Problem Framing / Design Sprint)

1. **Einstieg** – unverändertes Bildformat und bearbeitbare Textfelder. Neu: Kennzeichen "Orientierung und Strategie", Titel mit ruhiger Zweitzeile, schmale Kennzahlenzeile (persönliche Beratung / Expertennetzwerk / individueller Umfang) und der bestehende Terminweg.
2. **Ausgangslage und Ziel** – zwei offene Spalten mit senkrechten Linien (Zweck / Ergebnis) statt langer Fließtextblöcke. Die bisherigen Absätze aus "Was ist KI Consulting?" werden gekürzt übernommen.
3. **Persönliche Beratung und Netzwerk** – neuer, kurzer Abschnitt: Ich berate selbst zu Strategie, Potenzialen und Vorgehen; für spezialisierte Themen vermittle ich gezielt an Fachleute aus meinem Netzwerk.
4. **Beratungsansatz** – die sechs bestehenden Punkte (Geschäftsziele verstehen, KI-Potenziale, Roadmap, Technologie-Auswahl, ROI-Bewertung, Change Management) als ruhige nummerierte Abfolge mit feinen Trennlinien statt Kartenraster. Texte bleiben inhaltlich gleich, nur leicht gestrafft.
5. **Beratungsleistungen** – die sechs bestehenden Leistungen als offene Liste mit Trennlinien, Symbol und Kurzbeschreibung, im gleichen Rhythmus wie die Rollen-Liste bei Problem Framing.
6. **Branchen und Use Cases** – die vier bestehenden Branchen bleiben, dargestellt als schlichtes zweispaltiges Raster mit Linien statt schwerer Karten.
7. **Einordnung in die Leistungen** – kurzer Verweis, wie Beratung und die Workshops zusammenspielen, mit Links zu Problem Framing, Design Sprint und KI-Entwicklung.
8. **Abschluss** – breite, ruhige Fläche mit dem bestehenden Terminweg; die Abschnitte "Warum one-next?" und der jetzige CTA werden zu einem Abschluss zusammengeführt, damit sich nichts wiederholt.

## Gestaltung

Aufbau, Abstände, Typografie (Sora/Manrope) und Bildgröße folgen Problem Framing. Cream & Slate mit semantischen Farbtokens, dezente Linienicons, dünne hellblaue Rahmen, eckige Schaltflächen. Keine Farbverlauf-Überschriften, keine schweren Karten, keine dekorativen Hintergrundblasen. Auf dem Smartphone werden längere Abschnitte aufklappbar.

## Technische Hinweise

- `src/pages/AIConsultingServices.tsx` wird auf die gemeinsame Struktur mit `ServicePageHero` und den Mustern aus `ProblemFramingWorkshop.tsx` umgebaut.
- Inhaltsbearbeitung über `usePageContent('ai-consulting-services')`, `InlineTextField` und `InlineTextArea` bleibt funktionsfähig.
- Bestehende SEO-Daten bleiben; Beschreibung und FAQ werden um die Netzwerk-Aussage ergänzt.
- `bg-gradient-primary bg-clip-text` wird durch die einheitliche Überschriftenhierarchie ersetzt.
- Abschluss: `npx tsgo --noEmit` sowie Sichtprüfung auf Desktop (1280×1800) und Smartphone (390×844).
