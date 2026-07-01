# Design-Sprint-Statistiken im Admin-Dashboard

Ziel: Als Admin auf einen Blick sehen, wer welche Sprints erstellt hat, welchen Status sie haben und wer sie abgeschlossen hat.

## Was du im Admin-Dashboard bekommst

Neuer Tab **"Sprints"** neben CMS / LMS / BMAD / Benutzer.

Inhalt:
1. **Kennzahlen oben** (Karten):
   - Sprints gesamt
   - Aktive Sprints
   - Abgeschlossene Sprints
   - Archivierte Sprints
   - Ø Fortschritt (aktueller Schritt) bei aktiven Sprints

2. **Tabelle "Alle Sprints"** mit Spalten:
   - Titel
   - Ersteller (Name / E-Mail aus `profiles`)
   - Modus (Solo / Team)
   - Status (Aktiv / Abgeschlossen / Archiviert)
   - Aktueller Schritt
   - Erstellt am
   - Abgeschlossen am (falls Status = done)
   - Mitglieder (Anzahl aus `sprint_members`)

   Filter: Status, Modus, Zeitraum. Suche über Titel/Ersteller.

3. **Detail-Drawer** pro Sprint (Klick auf Zeile):
   - Basisdaten + Problemstellung
   - Team-Mitglieder mit Rollen
   - Fortschritt: welche `sprint_steps` sind `completed_at IS NOT NULL`
   - Wer hat wann welchen Schritt abgeschlossen (aus `sprint_steps.updated_at` + `completed_at`)

## Technische Umsetzung

- **Neue Admin-Seite / Sektion**: `src/components/admin/SprintAdminManager.tsx` + Detail-Komponente `SprintAdminDetail.tsx`.
- **AdminDashboard.tsx**: neuen Tab-Trigger `sprints` + `<TabsContent value="sprints">` hinzufügen (Grid auf `grid-cols-5`).
- **Daten-Hook** `src/hooks/useAdminSprints.tsx`:
  - `useAllSprints()` — liest `sprints` + Join auf `profiles` (via zweitem Query anhand `owner_id`) und `sprint_members` count.
  - `useSprintDetail(id)` — `sprints` + `sprint_steps` + `sprint_members` mit Profil-Infos.
- **RLS**: Admins müssen alle Sprints lesen dürfen. Aktuelle Policies auf `sprints`, `sprint_steps`, `sprint_members` werden geprüft; falls Admins nicht bereits Vollzugriff haben, kommt eine Migration mit einer zusätzlichen SELECT-Policy `has_role(auth.uid(), 'admin')` für die drei Tabellen. Keine Schreib-Rechte.
- **"Abgeschlossen von / am"**: Standard-Signal ist `sprints.status = 'done'` + `sprints.updated_at`. Da es aktuell keine Spalte `completed_by` gibt, zeigen wir den Ersteller + Zeitpunkt der Statusänderung. Falls du echtes "abgeschlossen von" willst, ergänzen wir `completed_by uuid` und `completed_at timestamptz` auf `sprints` — bitte in der Rückfrage bestätigen.

## Nicht enthalten

- Kein Bearbeiten/Löschen fremder Sprints durch Admin (nur Lesen).
- Keine Export-Funktion in dieser Iteration (kann später als CSV nachgereicht werden).
