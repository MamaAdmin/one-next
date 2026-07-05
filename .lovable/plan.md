
## Was ich beim Durchspielen gefunden habe

Wenn man den Sprint aktuell von Schritt 1.1 bis 5.4 durchgeht, gibt es **zwei Klassen von Problemen**, die einen echten End-to-End-Durchlauf verhindern:

### 1. „Weiter"-Button blockiert unnötig hart
In `SprintStepCard.tsx` ist der Weiter-Button so verdrahtet:
```
disabled = saving || (typeof step.stimmenLimit === "number" && auswahl.length !== step.stimmenLimit)
```
Damit muss der Nutzer bei jedem Schritt mit `stimmenLimit` **exakt** so viele Optionen auswählen wie das Limit vorgibt. Das betrifft: 1.1 (2), 1.2 (3), 1.3 (4), 1.4 (5), 1.5 (3), 1.6 (1), 1.7 (1), 2.1 (4), 3.2 (3), 3.3 (1), 5.3 (5).
Reales Verhalten im Solo-Sprint: man landet ständig in Sackgassen (z. B. „ich habe nur 1 gute HMW, will aber trotzdem weiter"). Auch für Team ist das laut Design Sprint-Buch eine **Obergrenze**, keine Pflichtmenge.

### 2. 12 von 27 Schritten haben keine eigene UI
Für alle Varianten außer `checkbox-list`, `map` und `notes` zeigt `SprintWorkspace.tsx` heute nur einen Platzhalter „Spezialansicht folgt" und darunter den generischen Checkbox-Renderer. Das führt bei diesen Schritten zu unbrauchbarer/irreführender UX:

| Schritt | Variante | Was fehlt |
|---|---|---|
| 1.6, 1.7 | flow-3-steps | 3 Karten „Entdecken → Lernen → Starten" / Kernerfahrung |
| 1.9 | form | Felder Interviewer/Recruiter/Ort/Bedarf/Video-Link |
| 1.10, 1.11, 3.5, 3.6, 5.4 | table | Tabelle mit Zeilen/Spalten |
| 2.3 | ideas | Freies Sammelfeld inkl. Doodles/Headlines |
| 2.4 | crazy8s | 8 Skizzen-Slots mit Timer |
| 2.5 | sketches | Solution Sketches (Upload/Bild + Titel) |
| 3.1 | heatmap | Punkte auf Skizzen setzen |
| 3.4 | storyboard | 6+ Panels als Flow |
| 4.1 | prototype | Storyboard-Screens + KI-Textvorschläge je Screen |
| 5.1 | scorecard | Kunden × Hypothesen-Matrix (grün/rot) |
| 5.2 | choice | „Bauen" ↔ „Mehr lernen" 2-Buttons-Entscheidung, ggf. neuen Sprint seeden |
| 5.3 | hot-takes | Sticky-Sammlung + Voting |

Bei `2.2` (notes) sind KI-Vorschläge & Ranking bewusst aus — das lassen wir.

## Umsetzung in 3 kleinen Schritten

### Schritt A – Weiter-Blocker entschärfen (schnell, hoher Impact)
In `SprintStepCard.tsx`:
- `stimmenLimit` wieder als **Obergrenze** behandeln, nicht als Pflichtzahl.
- Weiter-Button: `disabled` nur, wenn `saving`.
- Zusätzlich weiche Warnung anzeigen, wenn `auswahl.length > step.stimmenLimit` (aktuell durch `toggleAuswahl` schon technisch verhindert) oder wenn `auswahl.length === 0` und der Schritt nicht Variante `notes`/`prototype` ist (Hinweis, keine Sperre).
- Bei den echten „genau 1"-Schritten (1.6, 1.7, 3.3, 5.2) bleibt die 1er-Limitierung durch `stimmenLimit=1` erhalten — aber der Weiter-Button lässt auch 0 durch (Nutzer kann bewusst überspringen).

Damit wird der bestehende Ablauf sofort end-to-end klickbar.

### Schritt B – Einheitliches „Freitext-Sammel"-Fallback für einfache Varianten
Für Varianten, deren Kern eine strukturierte Liste ist, aber die noch keine Custom-UI haben, einen kleinen gemeinsamen Renderer bauen, damit KI-Vorschläge + „Deine Antworten" + optional Ranking überall funktionieren:

- `ideas` (2.3), `crazy8s` (2.4), `sketches` (2.5), `hot-takes` (5.3) → gleicher Sticky-Note-Renderer wie heute, aber ohne den „Spezialansicht folgt"-Banner und mit passenden Labels (z. B. „Skizzen-Idee", „Crazy-8-Slot 1..8", „Hot Take").
- `heatmap` (3.1): jede Skizzen-Idee bekommt einen Zähler „Punkte", Nutzer klickt +/– statt Checkbox-Voting. Ergebnis wird als `heatmapPunkte` in `SprintStepData` gespeichert.
- `storyboard` (3.4) und `prototype` (4.1): geordnete Panel-Liste (6+ Karten mit Titel + Beschreibung), Reihenfolge per Buttons hoch/runter. KI-Vorschläge pro Panel via bestehende `sprint-ai-suggest`-Funktion.

### Schritt C – Strukturierte Spezialansichten
Für die stark strukturierten Schritte einen dedizierten Renderer:

- **`flow-3-steps` (1.6, 1.7)**: drei Textfelder „Entdecken · Lernen · Starten" bzw. „Schritt 1 · 2 · 3", jedes Feld einzeln KI-vorgeschlagen. Gespeichert als `flow: {step1, step2, step3}`.
- **`form` (1.9)**: fünf beschriftete Inputs.
- **`table` (1.10, 1.11, 3.5, 3.6, 5.4)**: einfache Zeilen-Editor-Tabelle mit vordefinierten Spalten pro Schritt (Konfig zentral in `steps.ts` ergänzen). Speichern als `table: {columns, rows}`.
- **`scorecard` (5.1)**: Matrix „Kunde × Hypothese" mit 3 Zuständen (grün/rot/leer).
- **`choice` (5.2)**: zwei große Buttons; „Mehr lernen" bereitet Werte für einen Folge-Sprint vor (nur UI-Trigger, echtes Seeding als Folge-Ticket).

Alle neuen Varianten schreiben in ein neues optionales Feld `structured` auf `SprintStepData` (Typ pro Variante), damit `SprintDaySummary` und die Kontext-Panels sie später konsistent lesen können. `antworten`/`auswahl` bleiben für den generischen Weg unangetastet — also keine Migration nötig.

### Schritt D – Verifikation
Nach den Änderungen einen kompletten Solo-Sprint durchklicken (1.1 → 5.4) und für jeden Schritt prüfen:
1. Antworten schreiben ✔
2. KI-Vorschläge generieren + übernehmen ✔ (außer `notes`)
3. Auswahl treffen und speichern ✔
4. „Weiter" führt zum nächsten Schritt ohne Sackgasse ✔
5. One Pager (Tag 1–5) zeigt die Daten korrekt.

## Reihenfolge & Umfang
- Schritt A ist eine ~10-Zeilen-Änderung und macht den kompletten Sprint sofort durchklickbar. Nur damit ist der Report „end-to-end funktioniert" ehrlich einlösbar.
- Schritt B & C sind der eigentliche Feature-Ausbau. Falls du die zeitlich splitten willst, sag mir welche Varianten dir zuerst wichtig sind — ansonsten baue ich sie in obiger Reihenfolge.

## Rückfrage
Sollen wir zuerst nur **Schritt A** (Weiter-Blocker entschärfen, sofort spielbarer Sprint) umsetzen und den Rest in einem Folge-Turn, oder soll ich A + B + C in einem Rutsch bauen (größere Änderung)?
