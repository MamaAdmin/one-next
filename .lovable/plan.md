# Umbau: Framing → Team → Sprint

Ziel: Der Design Sprint entsteht ausschließlich beim Abschluss des Problem Framings. Das Framing wird vom Moderator (Ersteller) gestartet, und die Team-Konstellation ist immer die erste Seite. Steht das Team bereits, wird es beim Sprint-Start nicht erneut abgefragt; fehlt es, holt der Kickoff es nach.

## Neuer End-to-End-Flow

```text
/sprint/neu
  → Framing-Session anlegen (owner = Moderator)     ← KEIN Sprint mehr an dieser Stelle
  → redirect: /sprint/framing/:id  (Schritt "Team")
       ├─ Team-Konstellation (TeamRoleGrid)         ← neuer Pflicht-Erststep
       │   • Moderator = Ersteller (fix, nicht änderbar)
       │   • Rollen + E-Mail-Einladungen (wie heute im Sprint)
       │   • "Weiter" nur wenn Moderator gesetzt
       └─ Steps 1–10 (Problem Framing wie bisher)
  → FramingCompletionPanel.handleFinish()
       • erzeugt jetzt IMMER frisch den Sprint
       • kopiert framing_team_members → sprint_members
       • setzt framing_sessions.resulting_sprint_id
       → /sprint/:id/kickoff
            • Team ist vorbefüllt → nur Handover + "Sprint starten"
            • Ist das Team leer (Alt-Sessions/Edge-Case): Kickoff zeigt
              TeamRoleGrid erneut als Pflichtblock vor dem Start
```

## Wesentliche Änderungen

### 1. `SprintNew.tsx` — keine Sprint-Vorab-Erzeugung mehr
- „Team steht schon?"-Abfrage entfällt komplett.
- Nach Anlegen der Framing-Session direkt weiter zu `/sprint/framing/:id`.
- `SprintTeamSetup.tsx` und Route `/sprint/:id/team` werden nicht mehr aus diesem Pfad angesprungen (Datei/Route bleiben zunächst bestehen, aber ohne Einstiegspunkt).

### 2. Team-Konstellation als Framing-Schritt „team"
- `FRAMING_STEPS` in `src/features/framing/steps.ts` bekommt einen neuen ersten inhaltlichen Eintrag `team` vor dem heutigen Schritt „1 – Kick-off & Zielbild".
- `FramingWorkspace.tsx` rendert für diesen Step eine neue Komponente `FramingTeamStep`, die `TeamRoleGrid` einbindet — aber gegen Framing-Team-Daten statt `sprint_members`.
- Fortschritt ist blockiert, solange kein Moderator gesetzt ist (Moderator = `framing_sessions.owner_id`, wird beim Öffnen automatisch als Karte angezeigt und ist nicht löschbar).

### 3. Team-Daten am Framing statt am Sprint
- Neue Tabelle `framing_team_members` (Spiegel von `sprint_members`, aber `session_id` statt `sprint_id`).
  - Spalten: `id, session_id, user_id nullable, email, full_name, rolle, created_at`.
  - RLS analog `sprint_members` über `is_framing_member` / `can_edit_framing`.
  - GRANT SELECT/INSERT/UPDATE/DELETE authenticated, ALL service_role.
- Bestehende `sprint_invitations`-Logik wird generalisiert oder gespiegelt in `framing_invitations` (Einladungs-Mails via bestehende `send-sprint-team-invite`-Infrastruktur, angepasst auf Framing-Kontext & Landing auf Framing statt Sprint).
- Nicht angerührt: `framing_members` (Viewer/Editor-Sharing) — bleibt wie es ist.

### 4. Sprint-Erzeugung nur noch am Framing-Ende
- `FramingCompletionPanel.handleFinish()`
  - Immer neuer Sprint-Insert (Vorab-Sprint entfällt, weil unter Punkt 1 nie mehr erzeugt).
  - Direkt nach Insert (nach Trigger `add_sprint_moderator`) Kopie: alle Zeilen aus `framing_team_members` → `sprint_members` (Moderator-Zeile via Trigger bereits vorhanden, wird per Upsert nicht doppelt eingefügt).
  - `framing_sessions.resulting_sprint_id` wie bisher setzen.
- „Sprint aus Framing erzeugen"-Button im Dashboard bleibt, führt weiter ins Framing (dort dann Abschluss).

### 5. Kickoff verhält sich fallweise
- `SprintKickoff.tsx`: wenn `sprint_members` bereits Rollen enthält (Regelfall aus Framing-Übernahme) → nur Handover + „Sprint starten" wie heute.
- Wenn leer (Alt-Sprints oder Edge-Case) → TeamRoleGrid als Pflichtblock, Start bleibt gesperrt bis Moderator vorhanden.

### 6. „Moderator startet Framing"
- Da die Framing-Session mit `owner_id = auth.uid()` angelegt wird, ist der Ersteller technisch Moderator. Die UI benennt das explizit: im Team-Step ist die Moderator-Karte vorbelegt und nicht entfernbar; andere User (per Einladung) sehen die Session read-only bzw. als Mitglied entsprechend `framing_members.rolle`.
- Kein zusätzliches Route-Gating nötig — `RequireAuth` genügt, weil Framing-Ownership über RLS geregelt bleibt.

## Datenmodell — Migration

- `CREATE TABLE public.framing_team_members (...)` inkl. `GRANT` + RLS + Policies analog `sprint_members`.
- Optional (Phase 2): `framing_invitations` analog `sprint_invitations`, sonst Wiederverwendung mit zusätzlichem `session_id`-Feld.
- Keine Änderung an `sprints`, `sprint_members`, `framing_sessions` außer dass `resulting_sprint_id` weiterhin genutzt wird.

## Nicht Teil dieses Umbaus

- Kein Zusammenlegen von `framing_members` (Sharing) und `framing_team_members` (Sprint-Team) — bewusst getrennte Konzepte.
- Miro bleibt ausgeblendet wie zuletzt.
- `SprintTeamSetup.tsx` wird nicht gelöscht, nur nicht mehr verlinkt (Aufräumen kann später erfolgen).

## Offene Frage (bitte kurz bestätigen, sonst nehme ich die Standardannahme)

- **Standardannahme**: Alt-Framings ohne Team-Step landen beim Öffnen weiterhin direkt auf ihrem alten Step; der neue „team"-Step wird nur für ab jetzt neu erstellte Sessions erzwungen. → OK so, oder soll der Team-Step auch für bestehende offene Sessions Pflicht werden?
