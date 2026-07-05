
# Moderator als Sprint-Owner und Pflichtrolle

Der Moderator ist der zentrale Sprint-Owner: er erstellt den Sprint, lädt Mitglieder ein, alle greifen über seinen Account zu, und er ist später auch der Zahler. Der Decider bleibt eine wichtige Empfehlung, ist aber nicht mehr blockierend.

## Änderungen

### 1. Rollenmodell
- Neue Rolle **`moderator`** ergänzt (zusätzlich zu `decider`, `sprint_leader`, `finance`, `marketing`, `customer`, `tech`, `design`, `wildcard`).
- Beim Erstellen eines Sprints wird der eingeloggte User automatisch als `moderator` in `sprint_members` eingetragen (zusätzlich zu `owner_id` auf `sprints`).
- `sprint_leader` als Default für den Ersteller entfällt — der Ersteller ist der Moderator.
- Nur der Moderator kann Einladungen versenden und Rollen zuweisen (Berechtigungslogik in `useSprintTeam` + `send-sprint-team-invite` prüfen).

### 2. Kickoff-Gate (`SprintKickoff.tsx`)
- Bedingung für „Sprint starten" ändert sich:
  - Handover bestätigt **UND**
  - **Moderator ist gesetzt** (durch Ersteller automatisch erfüllt, aber Check bleibt für Robustheit).
- Decider wird **nicht mehr** als Pflicht geprüft. Statt Blocker eine gelbe Empfehlungs-Info: „Empfohlen: Weise einen Decider zu, damit Entscheidungen im Sprint verbindlich getroffen werden können." (nicht blockierend).
- Moderator-Kachel im `TeamRoleGrid` visuell hervorgehoben (z. B. Badge „Sprint-Owner", nicht entfernbar/übertragbar in v1).

### 3. Einladungs-Flow
- `InviteMemberDialog` und `send-sprint-team-invite`: Absender-Text und Copy anpassen — Einladung erfolgt „durch den Moderator". Empfangs-Mail nennt den Moderator namentlich als Einladenden.
- `accept-sprint-team-invite`: eingeladener User wird `sprint_members`-Eintrag mit gewählter Rolle, aber ohne Ownership. Zugriff läuft weiterhin über RLS auf Basis Sprint-Membership — funktional teilen sich damit alle den Sprint des Moderators (keine Datenkopie).

### 4. UI-Copy
- `SprintKickoff`: Überschrift der Team-Sektion „Team & Rollen" mit Hinweistext: „Du bist der Moderator dieses Sprints. Du lädst dein Team ein und behältst die Kontrolle über Sprint und (später) Abrechnung."
- Decider-Warnung → Empfehlungs-Callout (Ton, Farbe: `bg-muted`, kein `destructive`).

### 5. Payment-Vorbereitung (nur Vorbereitung, kein Payment-Code)
- Kommentar/TODO in `SprintNew`/`SprintKickoff`: künftige Zahlungsverantwortung ist an `sprints.owner_id` (Moderator) gekoppelt. Keine Änderung am Schema jetzt nötig, da `owner_id` bereits existiert.

## Technische Details

**Migration:**
- Kein neues Feld nötig. Es reicht, den Moderator als `sprint_members`-Eintrag mit `rolle = 'moderator'` beim Sprint-Erstellen zu setzen. Ergänzung in `SprintNew.tsx` nach `insert` auf `sprints`.
- Bestehende Sprints ohne Moderator-Zeile: Migration ergänzt für jeden Sprint einen `sprint_members`-Eintrag `(sprint_id, user_id = owner_id, rolle = 'moderator')` per `ON CONFLICT DO NOTHING`.

**Frontend-Dateien:**
- `src/pages/sprint/SprintNew.tsx` — nach Sprint-Insert Moderator in `sprint_members` schreiben.
- `src/pages/sprint/SprintKickoff.tsx` — Gate-Logik: Decider-Check entfernen, durch Moderator-Check ersetzen; Empfehlungs-Callout für Decider.
- `src/components/sprint/TeamRoleGrid.tsx` — Moderator-Rolle rendern, Badge „Sprint-Owner", nicht entfernbar; Decider-Kachel als „empfohlen" statt „Pflicht".
- `src/hooks/useSprintTeam.tsx` — `canInvite` / `canAssignRoles` = nur wenn eingeloggter User `moderator` (oder `owner_id === auth.uid()`).
- `src/components/sprint/InviteMemberDialog.tsx` — Copy-Update.
- `supabase/functions/send-sprint-team-invite/index.ts` — Prüfung: nur Moderator darf einladen; E-Mail-Copy erwähnt Moderator-Namen.

## Nicht Teil dieses Plans
- Übertragung der Moderator-Rolle an eine andere Person.
- Payment-Integration selbst.
- Mehrere Moderatoren pro Sprint.
