# Miro-Integration für Crazy 8s (Option C)

## Hinweis vorab

Miro ist **nicht** als vorgefertigter App-User-Connector in Lovable verfügbar. Die Integration muss deshalb als **eigener OAuth-2.0-Flow** implementiert werden. Für den Moderator (Sprint-Owner) wird pro Account einmal die Miro-Verbindung hergestellt; das Board ist danach für das ganze Team sichtbar.

## Voraussetzungen

Der Moderator muss selbst eine **Miro Developer App** anlegen:
1. https://developers.miro.com/ → "Create new App"
2. **Redirect URI**: `https://one-next.com/miro/callback` (Prod) + `https://<preview>.lovable.app/miro/callback` (Preview)
3. **Scopes**: `boards:read`, `boards:write`, `identity:read`
4. Client ID und Client Secret notieren

Diese beiden Werte werden als Secrets in Lovable Cloud gespeichert: `MIRO_CLIENT_ID`, `MIRO_CLIENT_SECRET`.

## Architektur

```text
Moderator (Browser)
   │  1. „Mit Miro verbinden" (Popup)
   ▼
Miro OAuth Authorize
   │  2. Redirect mit ?code=...
   ▼
Edge Function: miro-oauth-callback
   │  3. Token-Exchange, speichert Tokens verschlüsselt in miro_connections
   ▼
Edge Function: miro-create-crazy8-board
   │  4. Erstellt Board + 8 Frames via Miro REST API
   │     Speichert board_id/url in sprint_miro_boards
   ▼
Frontend Crazy8sRenderer
   │  5. Zeigt eingebettetes Board (<iframe src=embed_url>)
   │  6. Optional: „Ergebnisse übernehmen" → liest Sticky Notes
   ▼
Edge Function: miro-fetch-board-items
      → speichert Texte als antworten in sprint_steps
```

## Datenmodell (Migration)

**Neue Tabelle `miro_connections`** (pro User)
- `id uuid pk`, `user_id uuid → auth.users`, `miro_user_id text`, `miro_team_id text`
- `access_token text`, `refresh_token text`, `token_expires_at timestamptz`
- `created_at`, `updated_at`
- RLS: nur eigener User; GRANT authenticated + service_role.

**Neue Tabelle `sprint_miro_boards`**
- `id uuid pk`, `sprint_id uuid → sprints`, `step_key text`
- `board_id text`, `board_url text`, `embed_url text`
- `created_by uuid → auth.users`, `created_at`, `updated_at`
- Unique-Index auf `(sprint_id, step_key)`
- RLS: lesbar für Sprint-Members (`is_sprint_member`), schreibbar für `can_edit_sprint`.

## Backend (Edge Functions)

1. **`miro-oauth-start`** — baut Authorize-URL mit `state` (CSRF).
2. **`miro-oauth-callback`** — tauscht `code` gegen Token, speichert in `miro_connections`, schließt Popup via `postMessage`.
3. **`miro-refresh-token`** — intern von den anderen Functions aufgerufen, wenn Token abgelaufen.
4. **`miro-create-crazy8-board`** — Input: `sprint_id`. Prüft Moderator-Rolle, erstellt Board über `POST /v2/boards`, legt 8 Frames per `POST /v2/boards/{id}/frames`, speichert in `sprint_miro_boards`.
5. **`miro-fetch-board-items`** — Input: `sprint_id`. Liest Sticky Notes der 8 Frames (`GET /v2/boards/{id}/items?type=sticky_note`), gruppiert nach Frame, gibt Text-Array zurück.

Alle mit `verify_jwt = true`, CORS, Zod-Validierung, Fehler-Handling.

## Secrets

- `MIRO_CLIENT_ID` (Moderator/Projekt-Owner legt Miro-App an)
- `MIRO_CLIENT_SECRET`

## Frontend

**Neue Hook-Datei `src/hooks/useMiro.tsx`**
- `useMiroConnection()` — prüft ob aktueller User verbunden ist.
- `useConnectMiro()` — öffnet OAuth-Popup, wartet auf `postMessage`.
- `useSprintMiroBoard(sprintId, stepKey)` — Board-Row.
- `useCreateCrazy8Board(sprintId)` — Mutation.
- `useImportCrazy8Results(sprintId)` — ruft `miro-fetch-board-items` + speichert als `antworten`.

**Neue Komponente `src/components/sprint/Crazy8sMiro.tsx`**
- Zustandslogik:
  - Nicht verbunden → Button „Mit Miro verbinden".
  - Verbunden, kein Board → Button „Crazy-8-Board erstellen" (nur für Moderator sichtbar).
  - Board existiert → `<iframe src={embed_url}>` mit Vollbild-Toggle, Buttons „Board in Miro öffnen" und „Ergebnisse übernehmen".
- Info-Karte mit Crazy-8s-Anleitung + Timer (bestehende Timer-Logik wiederverwenden).

**Integration in `SprintStepCard.tsx`**
- Neuer Zweig: `step.variant === "crazy8s"` → rendert `<Crazy8sMiro />` statt der Standard-Textliste.
- Standard-Notizfeld + Weiter-Button bleiben unten erhalten.

## Optional (später)

- Board wird automatisch aus Miro-Template kopiert (schöneres Layout, Titel-Frames pro Person).
- Solution-Sketch (Schritt 2.5) bekommt gleichen Mechanismus.
- Team-Modus: Board nur einmal pro Sprint; alle Members greifen aufs Board des Moderators zu.

## Betroffene Dateien

- **Migrationen**: `miro_connections`, `sprint_miro_boards` inkl. RLS + GRANTs.
- **Neu**: `supabase/functions/miro-oauth-start/index.ts`, `miro-oauth-callback/index.ts`, `miro-refresh-token/index.ts`, `miro-create-crazy8-board/index.ts`, `miro-fetch-board-items/index.ts`
- **Neu**: `src/hooks/useMiro.tsx`, `src/components/sprint/Crazy8sMiro.tsx`, `src/pages/MiroCallback.tsx` (Popup-Ziel)
- **Edit**: `src/components/sprint/SprintStepCard.tsx` (neuer Zweig für `crazy8s`), `src/App.tsx` (Route `/miro/callback`), `supabase/config.toml` (verify_jwt-Blöcke).

## Aufwand

Backend ~2–3 Tage, Frontend ~2 Tage, Testing/Polish 1 Tag. Gesamt **5–6 Tage**.

## Offene Fragen vor der Umsetzung

1. **Miro-App-Registrierung**: Legst du selbst die Miro Developer App an (empfohlen, dein Firmen-Account) oder soll ich die Anleitung dafür vorbereiten? Client ID + Secret brauche ich vor Deployment.
2. **Nur Moderator verbindet oder jedes Team-Mitglied?** Empfehlung: nur der Moderator verbindet Miro. Alle anderen sehen das Board eingebettet (Miro-seitige Freigabe muss „Anyone with link can edit" sein oder Team-Workspace).
3. **Import der Ergebnisse**: Sollen Sticky-Note-Texte in one-next als „Antworten" gespeichert werden (fürs Voting in Schritt 3), oder reicht ein Board-Screenshot als Referenz?
