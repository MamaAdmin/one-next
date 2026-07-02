## Problem

Nach Abschluss eines Problem-Framings verschwindet es aus der Sprint-Übersicht (`SprintDashboard` filtert `activeFramings = status === "active"`). Am erzeugten Sprint ist außerdem nirgends sichtbar, dass er aus einem Framing hervorgegangen ist.

## Fix

In `src/pages/sprint/SprintDashboard.tsx`:

1. **Framings-Sektion umbenennen und alle Framings anzeigen** — nicht nur aktive.
   - Titel: „Problem-Framing-Workshops".
   - Status-Badge: `Aktiv` (default) / `Abgeschlossen` (secondary) / `Archiviert` (outline).
   - Bei abgeschlossenen: Untertext „Framing abgeschlossen – Ergebnisse einsehbar" statt „Framing läuft …".
   - Karte bleibt klickbar → `/sprint/framing/{id}` (Workspace zeigt vorhandene Antworten weiterhin an, nur eben mit Status „done").

2. **Sprint-Kärtchen kennzeichnen, wenn aus Framing entstanden.**
   - Aus `framingSessions` eine Map `sprintId → framingSession` bauen (über `resulting_sprint_id`).
   - Wenn Treffer: kleines Badge/Chip „Aus Problem Framing" (mit Compass-Icon) neben dem Titel oder unter der Modus-Zeile.
   - Der Chip ist ein Link auf `/sprint/framing/{framingId}` (öffnet den zugehörigen Framing-Workspace in neuem Tab oder inline; ich nutze regulären Router-Link, Klick stoppt Sprint-Card-Link-Propagation).

3. **Leere Sektion nicht rendern** — falls `framingSessions.length === 0` bleibt der Bereich weiterhin ausgeblendet.

Keine Änderungen an Backend, Datenmodell oder anderen Seiten. FramingWorkspace bleibt unverändert – abgeschlossene Sessions sind bereits lesbar, weil `useFramingSession` und `useFramingSteps` unabhängig vom Status laden.