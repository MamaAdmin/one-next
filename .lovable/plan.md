# Admin-Dashboard: Reihenfolge und BMAD-Start

Im Admin-Dashboard soll die Abfolge der Angebote sichtbar werden: erst Problem Framing, dann Design Sprint, danach BMAD. BMAD lässt sich entweder aus einem abgeschlossenen Sprint heraus starten (kombiniert) oder weiterhin eigenständig.

## Reihenfolge im Dashboard

- Die Reiter werden umsortiert zu: CMS, LMS, **Sprints**, **BMAD**, Benutzer. BMAD steht damit hinter den Sprints.
- Der Sprints-Bereich wird in zwei klar benannte Blöcke geteilt: zuerst **Problem Framing**, darunter **Design Sprints**. Die bestehenden Tabellen und Statistiken bleiben inhaltlich unverändert, nur die Reihenfolge und die Zwischenüberschriften kommen dazu.
- Im BMAD-Bereich erscheint oben ein kurzer Hinweis, dass BMAD auf den Ergebnissen aus Problem Framing und Design Sprint aufbaut, mit einem Link in den Sprints-Bereich.

## BMAD starten: kombiniert oder eigenständig

Der Dialog "Neue BMAD Session" bekommt oben eine Auswahl:

**1. Aus abgeschlossenem Sprint (empfohlen)**
- Eine Liste zeigt nur Sprints mit Status "Abgeschlossen", deren zugehöriges Problem Framing ebenfalls abgeschlossen ist. Ist nichts vorhanden, erscheint der Hinweis "Noch kein abgeschlossener Sprint vorhanden" und die Auswahl bleibt gesperrt.
- Nach der Auswahl werden Titel und Projekt-Kontext automatisch aus dem Sprint vorbefüllt: Challenge Statement, Zielgruppe, Erfolgsmessung, Sprint-Fragen und Risiken. Die Felder bleiben bearbeitbar.
- Die neue BMAD-Session merkt sich, aus welchem Sprint und welchem Problem Framing sie entstanden ist. In der Sessionliste und in der Sessiondetailansicht wird die Herkunft mit Link angezeigt.

**2. Eigenständig**
- Wie bisher: Titel und Projekt-Kontext frei eingeben, ohne Verknüpfung. Ein kurzer Hinweis erklärt, dass ohne vorangegangenen Sprint weniger Vorwissen einfliesst.

In der Sprint-Übersicht im Admin-Dashboard erhält jeder abgeschlossene Sprint zusätzlich die Aktion "BMAD starten", die direkt in diesen Dialog mit vorausgewähltem Sprint führt.

## Technische Hinweise

- Datenbank: `bmad_sessions` erhält die optionalen Spalten `sprint_id` (Verweis auf `sprints`, `on delete set null`) und `framing_session_id` (Verweis auf `framing_sessions`, `on delete set null`), plus Index auf `sprint_id`. Bestehende RLS-Policies und Grants gelten unverändert weiter; keine neuen Tabellen.
- `supabase/functions/bmad-create-session` nimmt die beiden neuen IDs optional entgegen, prüft serverseitig, dass der angegebene Sprint dem Aufrufenden gehört oder er Admin ist und den Status `done` hat, und speichert die Verknüpfung.
- `src/components/admin/BMADSessionCreator.tsx`: Moduswahl, Sprintliste (Sprints mit `status = 'done'` und `deleted_at is null`, verknüpftes Framing über `framing_sessions.resulting_sprint_id` mit `status = 'done'`), Vorbefüllung des Kontexts, optionaler Start mit vorausgewähltem Sprint über eine Prop.
- `src/pages/AdminDashboard.tsx`: Reiterreihenfolge, Zwischenüberschriften im Sprints-Bereich, Hinweisblock im BMAD-Bereich.
- `src/components/admin/SprintAdminManager.tsx`: Problem-Framing-Tabelle vor der Sprint-Tabelle, Aktion "BMAD starten" bei abgeschlossenen Sprints.
- Herkunftsanzeige in `src/pages/admin/BMADSessionDashboard.tsx` und `src/pages/admin/BMADSessionDetail.tsx`.
- Bestehendes Cream-&-Slate-Design, eckige Schaltflächen mit dünnem hellblauen Rahmen, deutschsprachige Texte.
- Abschluss: `npx tsgo --noEmit`, Edge-Function neu ausrollen, Prüfung im Browser als angemeldeter Admin.
