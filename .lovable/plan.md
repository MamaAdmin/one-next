## Ziel

Kein Solo-Modus mehr. Jeder Sprint läuft als Team. Der Weg von der Idee bis zum Sprint-Start bekommt eine neue Zwischenseite ("Kickoff") mit Outcome-Handover und Team-Konstellation. Der Decider ist Pflicht.

## Neuer User-Flow

```text
/sprint/neu
  ├─ Arbeitstitel eingeben
  └─ Frage: "Steht dein Team schon?"  ── Ja ──▶ /sprint/:id/team  ──▶ /sprint/framing/:fid
                                       └─ Nein ─▶ /sprint/framing/:fid

Framing abschließen (Schritt 10)
  ──▶ /sprint/:id/kickoff   ← neue Zwischenseite (Pflicht-Gate)
        ├─ Handover-Card (Outcome aus Framing, editierbar, bestätigen)
        ├─ Team-Konstellation (Rollen + Invites)
        └─ "Sprint starten"  (nur aktiv wenn Handover bestätigt UND Decider gesetzt)
              ──▶ /sprint/:id  → Schritt 1.1 startet ohne Handover-Card
```

## Team-Rollen

Feste Werte für `sprint_members.rolle`:

- `decider` – Pflicht, blockiert Sprint-Start wenn leer.
- `sprint_leader` – standardmäßig der Owner (KI moderiert, Sprint Leader hält organisatorisch Kurs).
- `finance`, `marketing`, `customer`, `tech`, `design` – empfohlen.
- `wildcard` – optional.
- `viewer` – bleibt bestehen für stille Beobachter.

Eine Person kann mehrere Rollen halten → Mehrfachzuweisung erlaubt (mehrere Zeilen pro `user_id`).

## Team-Konstellations-UI

Karte pro Rolle mit:
- Vollständiger Name (Textfeld)
- E-Mail (Textfeld)
- Status-Badge: „Noch offen" / „Eingeladen" / „Angenommen"
- Aktionen: „Einladen", „Erneut senden", „Entfernen"

Decider-Karte visuell hervorgehoben (rötlicher Ton wie aktuelle Handover-Warnung) mit Hinweis „Ohne Decider verliert der Sprint seine Verbindlichkeit."

Eigene Person kann per Klick „Ich übernehme diese Rolle" ohne E-Mail-Invite eingetragen werden (`user_id = auth.uid()`, kein Invite nötig).

Auf `/sprint/:id/team` (Vor-Framing-Variante) reicht Rollen setzen; man kann später über den Kickoff nachbessern.

## Kickoff-Seite

Route: `/sprint/:id/kickoff`. Zwei Blöcke:

1. **Outcome aus dem Problem Framing** – die bestehende `SprintHandoverCard` wandert komplett hierhin, weiterhin editierbar bis „Übernahme bestätigen".
2. **Team-Konstellation** – gleiche UI wie oben, mit Pflicht-Decider-Prüfung.

Am Ende ein prominenter Button „Sprint starten". Solange Handover nicht bestätigt oder Decider fehlt → Button disabled mit klarem Grund-Text.

Aus `SprintWorkspace` (Schritt 1.1) wird `SprintHandoverCard` entfernt. Erreicht ein Sprint 1.1 ohne bestätigten Kickoff → automatisch nach `/sprint/:id/kickoff` umleiten.

## Datenmodell-Änderungen (eine Migration)

1. `sprints.modus` – CHECK-Constraint auf `'team'` einengen, Default `'team'`, bestehende `'solo'`-Zeilen auf `'team'` migrieren. Feld bleibt bestehen, um bestehende Reports nicht zu brechen.
2. `sprints.kickoff_confirmed_at timestamptz null` – gesetzt sobald der User „Sprint starten" auf dem Kickoff klickt. Steuert die Weiterleitung.
3. Neue Tabelle `sprint_invitations` (analog `bmad_invitations`):
   - `id`, `sprint_id`, `email`, `full_name`, `role_type text` (einer der Rollen oben), `token text unique`, `status text` (`pending`/`accepted`/`revoked`/`expired`), `expires_at timestamptz`, `invited_by uuid`, `created_at`, `accepted_at`.
   - GRANTs für `authenticated` (Owner liest/schreibt) und `service_role`. RLS: Owner darf CRUD, Eingeladener darf lesen per Token via `SECURITY DEFINER`-Function `get_sprint_invitation_by_token`.
4. `sprint_members.rolle` – bestehende Werte auf neue Rollen mappen (`member` → `sprint_leader` für Owner-Zeilen, sonst `viewer`). Kein CHECK-Constraint, damit spätere Rollenerweiterung ohne Migration möglich ist.

## Backend-Funktionen (Edge Functions)

- Neue Function `send-sprint-invitation` (nutzt bestehende Resend-Infrastruktur, ruft `send-transactional-email` mit neuem Template `sprint-invitation.tsx` auf).
- Neue Template-Datei `supabase/functions/_shared/transactional-email-templates/sprint-invitation.tsx` (React Email, Brand-konform, Registry-Update).
- Neue Function `accept-sprint-invitation` (Token → Insert in `sprint_members`, `status='accepted'`).

## Frontend-Änderungen

- `src/pages/sprint/SprintNew.tsx` – zusätzlich Ja/Nein-Frage nach Team-Status. Nach Insert entweder Redirect zu `/sprint/:id/team` (Ja) oder direkt `createFraming` → `/sprint/framing/:fid` (Nein). In beiden Fällen wird der Sprint sofort angelegt, damit `sprint_id` für Members bereitsteht.
- Neue Datei `src/pages/sprint/SprintTeamSetup.tsx` – Standalone-Team-Konstellationsseite.
- Neue Datei `src/pages/sprint/SprintKickoff.tsx` – Zwischenseite mit Handover + Team + „Sprint starten"-Gate.
- Neue Komponenten:
  - `src/components/sprint/TeamRoleGrid.tsx` – Rollenkarten-Grid, wiederverwendbar in `SprintTeamSetup` und `SprintKickoff`.
  - `src/components/sprint/InviteMemberDialog.tsx` – Dialog für E-Mail-Invite.
- Neuer Hook `src/hooks/useSprintTeam.tsx` – Query/Mutations für `sprint_members` + `sprint_invitations`.
- Neue Seite `src/pages/sprint/AcceptSprintInvitation.tsx` unter Route `/sprint/invite/:token`.
- `src/pages/sprint/FramingWorkspace.tsx` – „Framing abschließen"-Aktion navigiert danach zu `/sprint/:id/kickoff` statt direkt zum Sprint.
- `src/pages/sprint/SprintWorkspace.tsx` – Handover-Card entfernen; wenn `sprint.kickoff_confirmed_at` NULL → Redirect zum Kickoff.
- `App.tsx` – neue Routen: `/sprint/:id/team`, `/sprint/:id/kickoff`, `/sprint/invite/:token`.

## Copy (KI-Sprache, Satzschreibweise)

- Zwischenseite Titel: „Sprint-Kickoff: Outcome & Team".
- Team-Seite Titel: „Team-Konstellation".
- Decider-Warnung: „Ohne Decider fehlt dem Sprint die Verbindlichkeit. Setze eine Person mit echter Entscheidungsbefugnis ein, bevor der Sprint startet."
- Button gesperrt: „Sprint starten ist erst möglich, sobald Decider gesetzt und Handover bestätigt ist."

## Nicht-Ziele

- Kein Umbau der bestehenden Framing-Schritte 1–10.
- Keine Änderung an bereits laufenden Sprints, die schon in Schritt >1.1 sind — dort läuft alles wie bisher weiter; Kickoff-Gate greift nur bei `kickoff_confirmed_at IS NULL AND current_step = '1.1'`.
- Keine Umbenennungen bestehender Dateien.

## Technische Reihenfolge

1. Migration (Modus, `kickoff_confirmed_at`, `sprint_invitations`, GRANTs, RLS, Helper-Function).
2. Sprint-Invitation-Template + Edge Functions + Deploy.
3. Neuer Hook `useSprintTeam`.
4. `TeamRoleGrid` + `InviteMemberDialog`.
5. `SprintTeamSetup`, `SprintKickoff`, `AcceptSprintInvitation` + Routen.
6. `SprintNew` erweitern (Ja/Nein-Frage).
7. `FramingWorkspace`-Abschluss → Kickoff-Redirect.
8. `SprintWorkspace` bereinigen (Handover-Card raus, Kickoff-Guard rein).
9. Manueller Rundlauf: neu anlegen → Framing → Kickoff → Sprint.
