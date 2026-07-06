
## Ziel

Drei Korrekturen an der Sprint-Team-Ansicht (`SprintKickoff` / `SprintTeamSetup` / `TeamRoleGrid`).

## 1. Eingeladene Personen wieder sichtbar

Aktuell zeigt `TeamRoleGrid` nur Einladungen mit `status === "pending"`. Nachdem wir die Mailinfrastruktur umgestellt haben, kommen Einladungen offenbar nicht mehr in der Liste an – wahrscheinlich weil der Status nach dem Versand anders belegt ist oder die Query den Datensatz nicht mehr lädt.

Maßnahmen:
- In `useSprintInvitations` alle Einladungen laden (nicht implizit gefiltert) und im Grid alles anzeigen, das **nicht** `accepted` oder `revoked` ist (also `pending` und ggf. `expired`).
- Status als kleines Badge sichtbar machen (`Eingeladen`, `Abgelaufen`).
- Debug-Check: einmal per `supabase--read_query` prüfen, ob die zuletzt versendeten Invites tatsächlich in `sprint_invitations` liegen und welchen Status sie haben, damit wir die Filterlogik korrekt setzen.

## 2. Sprint-Start nur durch den Moderator

In `src/pages/sprint/SprintKickoff.tsx` hängt `canStart` nur an `hasModerator && handoverConfirmed`. Damit könnte jedes Teammitglied, das die Kickoff-Seite öffnet, den Sprint starten.

Maßnahmen:
- Aktuellen User laden (bereits vorhanden via `supabase.auth.getUser`).
- `isOwner = currentUserId === sprint.owner_id`.
- `canStart = isOwner && hasModerator && handoverConfirmed`.
- Wenn nicht Owner: Start-Button disabled + Hinweistext „Nur der Moderator kann den Sprint starten."
- Analog in `SprintTeamSetup` den „Weiter zum Problem Framing"-Button für Nicht-Moderatoren deaktivieren (optional, konsistent).

## 3. Wildcard: mehrere Personen erlaubt, mit Maximal-Hinweis

Design-Sprint-Regel: max. 7 Personen im Raum. Wildcard soll mehrere Einladungen erlauben, andere Rollen bleiben wie gehabt.

Maßnahmen in `TeamRoleGrid.tsx`:
- Rollen-Definition um `multi?: boolean` erweitern; nur `wildcard` bekommt `multi: true`.
- Für Nicht-Multi-Rollen: „Person einladen" ausblenden, sobald bereits ein Member **oder** ein Pending-Invite existiert (verhindert Doppelt-Einladungen, macht die aktuelle Sichtbarkeitsanomalie sofort klar).
- Für Wildcard: „Person einladen" bleibt immer sichtbar; kleiner Hinweistext unter der Karte:
  „Design Sprints funktionieren am besten mit maximal 7 Personen im Team. Prüfe die Gesamtzahl bevor du weitere Wildcards einlädst."
- Zusätzlich eine dezente Gesamtzähler-Zeile oben im Grid: „Team aktuell X von 7 empfohlen." (Members + Pending-Invites summiert). Bei >7 orange eingefärbt, keine harte Sperre.

## Technische Details

- Betroffene Dateien:
  - `src/hooks/useSprintTeam.tsx` – Filterlogik/Status-Rückgabe unverändert lassen; Query liefert schon alle Rows, nur das Grid filtert. Reine Frontend-Änderung.
  - `src/components/sprint/TeamRoleGrid.tsx` – Filter erweitern, Status-Badge, Multi-Logik, Wildcard-Hinweis, Teamzähler.
  - `src/pages/sprint/SprintKickoff.tsx` – Owner-Check + Button-Gating + Hinweistext.
  - `src/pages/sprint/SprintTeamSetup.tsx` – Owner-Check (optional).
- Kein DB-Schema-Change, keine Migration, keine Edge-Function-Änderung.
- Vor der Umsetzung ein `supabase--read_query` auf `sprint_invitations` für den aktuellen Sprint, um Status der fehlenden Einladung zu verifizieren.

## Verifikation

- Preview öffnen als Moderator: alle bisher versendeten Einladungen erscheinen im Grid mit Status-Badge.
- Wildcard-Karte erlaubt wiederholtes „Person einladen"; Hinweis + Teamzähler sichtbar.
- Andere Rollen: Einladen-Button verschwindet nach erster Einladung.
- Als Nicht-Owner (simuliert): Start-Button disabled, Hinweistext sichtbar.
