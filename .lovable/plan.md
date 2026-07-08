## Ziel

In Framing-Schritt 3 („Stakeholder & Zielgruppe") kommt im Desktop-Layout eine visuelle Stakeholder-Map dazu. Nutzer positionieren Stakeholder auf einer 2-Achsen-Fläche (Einfluss × Betroffenheit), Zielgruppe = Zentrum. Die bestehende Listen-UI bleibt erhalten – die Map ist eine zusätzliche Ansicht.

## Layout

Auf Desktop (`lg:` breakpoint) split-view innerhalb `CanvasSection "Stakeholder & Zielgruppe"`:

```text
+---------------------------+--------------------------------+
| Liste (bestehend)         |  Stakeholder-Map               |
| - ListEditor              |  ┌──────────────────────────┐  |
| - AcceptedKiList (blau)   |  │        hoher Einfluss    │  |
| - KI-Vorschläge inline    |  │                          │  |
| - Primäre Zielgruppe      |  │   ● Karl                 │  |
|                           |  │        ⊙ (Zielgruppe)    │  |
|                           |  │              ● Anna      │  |
|                           |  │        niedrig           │  |
|                           |  └──────────────────────────┘  |
|                           |  wenig betroffen ── stark      |
+---------------------------+--------------------------------+
```

Auf Mobile/Tablet: nur Liste (Map ausgeblendet, Positionen bleiben persistiert).

## Verhalten

- Jeder Stakeholder (eigene + KI-übernommene) erscheint als Chip auf der Map.
- **Neue Stakeholder** landen automatisch mittig-außen auf einer Spirale (kein Overlap).
- **Drag** verschiebt den Chip; Position wird relativ (0–1 auf beiden Achsen) gespeichert.
- **Zentrum (⊙)** markiert die primäre Zielgruppe – hervorgehoben, nicht draggable (Position fix Mitte).
- Achsenbeschriftung: X = „Betroffenheit" (wenig → stark), Y = „Einfluss" (niedrig → hoch).
- Chips für KI-Stakeholder in accent-Farbe (blau, konsistent mit AcceptedKiList), eigene neutral.
- Entfernen eines Stakeholders aus der Liste entfernt auch Position.

## Datenmodell

Neues Feld in `FramingStepData` (`src/features/framing/types.ts`):

```ts
stakeholderPositions?: Record<string, { x: number; y: number }>;
// key = Stakeholder-Name (identisch zu Einträgen in stakeholder / kiStakeholder)
// x, y = 0..1 relativ zur Map-Fläche
```

Kein Backend-Migration nötig – `data` ist bereits JSONB.

## Komponenten

- **Neu:** `src/components/framing/StakeholderMap.tsx`
  - Props: `stakeholder: string[]`, `kiStakeholder: string[]`, `primary: string`, `positions`, `onPositionsChange`
  - Pure HTML/CSS Drag (Pointer Events) – keine neue Dependency (react-flow/dnd-kit unnötig für diesen Scope).
  - Aspect-Ratio 4:3, `min-h-[420px]`, gestrichelter Border, Achsen-Labels als kleine Muted-Texte.

- **Angepasst:** `src/components/framing/FramingStepCard.tsx`
  - `renderStakeholder`-Block (ab Zeile 1173) wird zu `<div className="grid lg:grid-cols-2 gap-6">…`, links Liste, rechts `<StakeholderMap />`.
  - Positions werden aus `data.stakeholderPositions` gelesen, Updates via `patch({ stakeholderPositions: … })`.
  - Beim Entfernen aus `stakeholder`/`kiStakeholder`: gleichzeitig Position purgen.

## Nicht Teil dieses Schritts

- Realtime-Collab / Multi-User-Cursor.
- Verbindungslinien zwischen Stakeholdern.
- Export als Bild.
- Ähnliche visuelle Ansichten für andere Framing-Schritte (Problem-Baum etc.).

## Verifikation

- `bunx tsgo --noEmit`
- Visuelle Prüfung im Desktop-Preview: Stakeholder hinzufügen → Chip erscheint → Drag speichert → Reload behält Position → Entfernen aus Liste entfernt Chip.
