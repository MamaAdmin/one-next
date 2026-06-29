## Ziel

Nach dem letzten Schritt jedes Tages (1.11, 2.5, 3.6, 4.1, 5.4) wird automatisch ein **Tages-One-Pager** angezeigt, der die Ergebnisse des Tages zusammenfasst — mit Antworten je Schritt, finalen Auswahlen, eingebetteter Map (Tag 1) sowie einer KI-Zusammenfassung via Gemini. Der One Pager ist als In-App-Ansicht und als PDF-Download verfügbar.

## Was gebaut wird

### 1. Neue Edge Function `sprint-day-summary`
- Input: `{ sprintId, day }`
- Lädt Sprint + alle `sprint_steps` des Tages
- Ruft **Gemini 2.5 Flash** über Lovable AI Gateway (`google/gemini-2.5-flash`, `LOVABLE_API_KEY`) mit strukturiertem Kontext aller Schritte des Tages
- Erzeugt eine prägnante Executive Summary (3–5 Sätze) + Bullet-Liste der Key Decisions
- Persistiert das Ergebnis in `sprint_steps` unter step_key `summary.dayN` (data: `{ summary, keyDecisions, generatedAt }`), damit die Karte nicht bei jedem Öffnen neu generiert wird (Refresh-Button vorhanden)

### 2. Neue Komponente `SprintDaySummary.tsx`
- Rendert pro Tag eine A4-orientierte One-Pager-Karte mit:
  - Header: Sprint-Titel, Tag-Label, Datum
  - **KI-Zusammenfassung** (Gemini)
  - **Schritt-Blöcke**: pro Schritt die `frage`, finale `auswahl` (oder `antworten`), kompakt
  - Für Tag 1: eingebettete **Map-Visual** (read-only Variante der `MapBoard`-Lanes)
  - Footer mit Logo/Datum
- Buttons: „Neu generieren", „PDF herunterladen"

### 3. PDF-Export
- Library: `html2canvas` + `jspdf` (klein, client-side, kein Server nötig)
- Greift die One-Pager-DOM-Node, rendert sie als A4-PDF
- Dateiname: `OneNext_Sprint_<titel>_Tag<N>.pdf`

### 4. Auto-Trigger in `SprintWorkspace.tsx`
- Wenn der aktuell aktive Schritt der **letzte des Tages** ist (1.11/2.5/3.6/4.1/5.4) und `completed_at` gesetzt wurde, wird unterhalb der `SprintStepCard` automatisch `<SprintDaySummary day={N} />` eingeblendet.
- Außerdem: in der Side-Nav pro Tag ein kleiner „Zusammenfassung"-Eintrag, damit jeder Tag auch nachträglich aufgerufen werden kann.

### Technische Details

- **Day → letzte Step-Map**: `{1: "1.11", 2: "2.5", 3: "3.6", 4: "4.1", 5: "5.4"}`
- **Gemini-Prompt** (deutsch): rolle = Sprint-Coach, gibt prägnante Tagesbilanz, max 5 Sätze, dann 3–6 Bullet Key Decisions. Eingabe = JSON aus Step-Daten (Frage + Auswahl/Antworten/Notes).
- **Persistenz-Trick**: wir nutzen die bestehende `sprint_steps`-Tabelle mit `step_key = "summary.1"` … `"summary.5"`. Kein DB-Migration nötig (step_key ist text, kein FK auf Step-Definitionen).
- **Lovable AI**: `LOVABLE_API_KEY` ist bereits gesetzt.
- **Map-Embed Tag 1**: zeigt die 6 Lanes aus `MAP_LANES` mit den Items aus `mapZuordnung` von Schritt 1.8 als kompakte Read-only-Boxen.
- **Nur Frontend + 1 Edge Function** — keine DB-Schemaänderungen, keine neuen Tabellen.

### Dateien
- **Neu**: `supabase/functions/sprint-day-summary/index.ts`
- **Neu**: `src/components/sprint/SprintDaySummary.tsx`
- **Neu**: `src/components/sprint/MapBoardReadOnly.tsx` (kompakte Read-only-Map fürs One Pager)
- **Edit**: `src/pages/sprint/SprintWorkspace.tsx` (Auto-Einblendung + Nav-Eintrag pro Tag)
- **Edit**: `src/hooks/useSprint.tsx` (kleiner Hook `useDaySummary(sprintId, day)` zum Laden/Speichern der Summary-Row)
- **Dependency**: `bun add jspdf html2canvas`
