## Ziel
Ein Problem-Framing und der daraus entstandene Design Sprint sollen auf `/sprint` klar als **ein Vorhaben** erkennbar sein – umschlossen von einer gemeinsamen Gruppen-Card.

## Layout-Änderung in `src/pages/sprint/SprintDashboard.tsx`

Aktuell: getrennte Sektionen „Problem-Framing-Workshops" und „Design Sprints". Ein Framing und sein Ziel-Sprint stehen entkoppelt untereinander.

Neu: Eine kombinierte Sektion **„Meine Vorhaben"**, in der zusammengehörige Paare als eine Gruppen-Card gerendert werden:

```text
┌─ Vorhaben: [Arbeitstitel]  ───────────── [Status-Chip]
│
│  ┌─ Problem Framing ─────┐   ┌─ Design Sprint ────┐
│  │  Framing-Card         │ → │  Sprint-Card       │
│  │  (Schritt x/12)       │   │  (Schritt Map…)    │
│  └───────────────────────┘   └────────────────────┘
└──────────────────────────────────────────────────────
```

- Die Gruppen-Card ist die visuelle Klammer: dezenter Rahmen, kleine Kopfzeile mit Vorhaben-Titel + Icon-Chevron zwischen den beiden inneren Karten.
- Titel = `titel_arbeitstitel` des Framings (Fallback: Titel des Sprints).
- Innen zwei kompaktere Sub-Cards (Framing links, Sprint rechts), gleiche Struktur wie bisher, aber leichter (kleinerer Titel, kein doppelter Modus-Text).
- Chevron/Pfeil-Icon zwischen den Sub-Cards verstärkt „wurde zu".

## Fälle, die weiter separat bleiben

- **Framing ohne Sprint** → einzelne Framing-Card als eigene Gruppen-Card (Slot rechts zeigt Button „Sprint aus diesem Framing erzeugen", falls Framing abgeschlossen ist – ansonsten dezenter Platzhalter „Sprint entsteht nach Abschluss").
- **Sprint ohne Framing** → eigene Reihe „Direkt gestartete Sprints" darunter, bisheriges Grid unverändert.

## Bestehende Elemente

- Edit- und Löschen-Icons bleiben auf der Sprint-Sub-Card (Positionen wie aktuell, weiter links vom Aktiv-Badge).
- Alle Links, Statuslogik, Delete-Zähler, Restart-Hinweis (`MAX_SPRINT_RESTARTS`) bleiben unverändert.
- Farb-Tokens weiter aus `index.css` (`border-l-primary`, `bg-muted/30` für Gruppen-Hintergrund) – keine Hardcodes.

## Technische Umsetzung

- Neue Hilfsstruktur `groupedItems` im Component: paart `framing` ↔ `sprint` via `framing.resulting_sprint_id`, sammelt „nur Framing" und „nur Sprint" separat.
- Neue Sub-Komponenten (im selben File, klein): `VorhabenGroupCard`, `FramingSubCard`, `SprintSubCard`.
- Keine Backend-/Datenänderungen; nur Presentation.