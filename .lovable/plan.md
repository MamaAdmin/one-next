## Ziel

Nur noch **ein** Einstieg in den Design Sprint: jeder Nutzer startet zwingend über das Problem Framing. Der bisherige „Mein Problem ist klar → direkt Sprint" Pfad wird komplett entfernt.

## Änderungen

### 1. `src/pages/sprint/SprintDashboard.tsx`
- Zwei-Karten-Grid (Framing vs. Direkt-Sprint) entfernen.
- Stattdessen **eine** Einstiegskarte über die volle Breite: „Neuen Sprint starten" mit Erklärung, dass jeder Sprint mit einem kurzen Problem Framing (ca. 3–4 h, 10 Schritte) beginnt. Button führt zu `/sprint/neu`.
- Empty-State-Link „Ersten Sprint starten" bleibt auf `/sprint/neu`.

### 2. `src/pages/sprint/SprintNew.tsx`
- „Choose"-Screen und komplettes „clear"-Formular (Titel, Problemstellung, Challenge Statement, Zielgruppe, Erfolgsmessung, Sprint-Fragen, Modus, Decider, Sprint Leader, direkter `createSprint`-Flow) entfernen.
- Seite wird auf das Framing-Arbeitstitel-Formular reduziert: Nutzer gibt einen Arbeitstitel ein → `createFraming` → Redirect zu `/sprint/framing/:id`.
- Überschrift/Copy anpassen („Neuen Sprint starten" → beginnt mit Problem Framing).
- `useCreateSprint`, `Select`, ungenutzte Icons/Imports und das `mode`-State-Handling entfernen; `?mode=…` Query wird ignoriert.

### 3. `src/components/sprint/SprintHandoverCard.tsx`
- Aufräumen: Da jeder neue Sprint aus Framing kommt, wird der `!fromFraming`-Zweig (Hinweisbox „Doch mit Problem-Framing starten") überflüssig und entfernt.
- Bestehende Alt-Sprints ohne verknüpftes Framing zeigen die Karte weiterhin nicht (unverändertes Verhalten durch `if (!fromFraming) return null;`).

### 4. `src/pages/UserProfile.tsx`
- Link „/sprint/neu" behält Ziel, Label ggf. leicht angepasst („Neuen Sprint mit Problem Framing starten"), damit die Erwartung stimmt.

## Was **nicht** angefasst wird

- Datenbank / RLS / Tabellenschema (keine Migration nötig).
- Bestehende Sprints und deren Workspace (`/sprint/:id`) bleiben unverändert nutzbar.
- Direkt-Sprint-Erstellung via `useCreateSprint` bleibt im Hook erhalten (wird intern beim Framing-Abschluss weiter genutzt) – nur die UI-Route zum manuellen Anlegen fällt weg.

## Nach der Umsetzung sichtbar

- `/sprint`: eine einzige Startkarte, klarer Framing-First-Flow.
- `/sprint/neu`: nur noch Arbeitstitel + Button „Problem Framing starten".
- Handover-Card im Sprint zeigt nur noch den Framing-Kontext, ohne Alternativ-Hinweis.
