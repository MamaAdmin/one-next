
# Problem-Framing-Workshop (Schritt 0) vor dem Sprint

Ein neuer, optionaler Pre-Sprint-Workshop, in 10 timeboxed Schritten, der ein vages Problem sprint-reif schärft. Ergebnis (Challenge Statement) fließt automatisch als `problemstellung` (plus Titel/Zielgruppe/Risiken/Sprint-Fragen) in den neuen Sprint.

## 1. Einstieg im Sprint-Anlegen-Flow

In `SprintNew.tsx` oben eine Auswahl einbauen:

- **"Mein Problem ist klar"** → aktueller Flow (Titel/Problemstellung direkt eingeben, Sprint starten).
- **"Problem ist noch unscharf – Problem-Framing-Workshop starten"** → legt ein `framing_session` an und leitet nach `/sprint/framing/:id` weiter. Nach Abschluss wird daraus ein Sprint mit vorbefüllten Feldern erstellt.

Alternativ auf `/sprint` (Dashboard) ein zweiter primärer Button "Problem framen (3–4h Workshop)".

## 2. Daten-Modell (neue Tabellen)

Migration mit RLS + GRANTs analog zu `sprints`:

- `framing_sessions`
  - `id uuid pk`, `owner_id uuid not null` (=`auth.uid()`), `titel_arbeitstitel text`, `kontext text`
  - `current_step int default 1`, `status text check in ('active','done','archived') default 'active'`
  - `challenge_statement text`, `resulting_sprint_id uuid null references sprints(id)`
  - `created_at`, `updated_at`
- `framing_steps`
  - `id uuid pk`, `session_id uuid fk → framing_sessions on delete cascade`
  - `step_key text` (`'1'..'10'`), `data jsonb not null default '{}'`
  - `completed_at timestamptz null`, `created_at`, `updated_at`
  - unique(`session_id`,`step_key`)
- RLS: owner darf CRUD (`auth.uid() = owner_id` bzw. via session), Admin `has_role('admin')` read.
- GRANTs: `authenticated` full CRUD, `service_role` all.

## 3. Schritt-Konfiguration

Neue Datei `src/features/framing/steps.ts` mit `FRAMING_STEPS` Array (analog `SPRINT_STEPS`):

| # | Titel | Timebox | Variante | Speichert | nutzt |
|---|---|---|---|---|---|
| 1 | Kick-off & Zielbild | 15' | context+list | `kontext`, `nichtZiele[]` | – |
| 2 | Warum jetzt? & Default Future | 15' | two-fields | `warumJetzt`, `defaultFuture` | 1 |
| 3 | Stakeholder & Zielgruppe | 15' | list+select | `stakeholder[]`, `primaereZielgruppe`, `sekundaerGeparkt[]` | 1–2 |
| 4 | Smart Sailboat | 30' | sailboat (4 Bereiche) | `sailboat{wind,anker,hafen,eisberg}` | 1–3 |
| 5 | Root Cause & Cynefin | 20' | five-whys+cynefin | `fiveWhys[]`, `ursachen[]` | 1–4 |
| 6 | Annahmen & Risiken | 20' | 2×2 matrix | `annahmen[]`, `kritischeAnnahmen[]` | 1–5 |
| 7 | Erfolg & Constraints | 20' | field+list | `erfolgsmessung`, `constraints[]` | 3,4 |
| 8 | Scope-Cut & Sprint-Fragen | 25' | two-columns+list | `inScope[]`, `outOfScope[]`, `sprintFragen[]` | 5–7 |
| 9 | Priorisierung (NUF) | 15' | scorecard | `nufBewertungen[]`, `top1Challenge` | 8 |
| 10 | Entscheidung & Next Steps | 15' | todos+bool | `sprintGo`, `preSprintTodos[]` | alle |

Jeder Schritt-Def bekommt `frage`, `arbeit`, `timeboxMin`, `variant`, `nutztDatenAus`.

## 4. UI: Framing-Workspace

- Route: `/sprint/framing/:id` → neue Seite `FramingWorkspace.tsx` (Layout analog `SprintWorkspace`, aber ohne Days: 10-Schritte-Nav links).
- Header oben rechts: **Timer pro Schritt** (`useTimer` Hook, Countdown, Start/Pause/Reset, warnt bei Ablauf, blockiert nichts).
- Fortschritt-Leiste oben: „Schritt X von 10 · gesamte Timebox 3–4 h" (Summe der `timeboxMin`).
- Pro Schritt: `FramingStepCard.tsx` mit demselben Muster wie Sprint-Step:
  1. Anweisung/Ziel
  2. KI-Vorschläge als Checkbox-Liste (aus Edge Function)
  3. Eigenes Textfeld / listen-spezifische Inputs
  4. Kontext-Panel rechts: frühere Antworten der Schritte in `nutztDatenAus`
  5. Zurück / Weiter
- Spezialvarianten (Sailboat, 5-Whys, 2×2-Matrix, NUF-Scorecard, Scope-Zweispalter, To-do-Liste) als eigene kleine Komponenten unter `src/components/framing/variants/`.

## 5. KI-Vorschläge – Edge Function

Neue Function `supabase/functions/framing-ai-suggest/index.ts`:
- Input: `{ session_id, step_key }`, holt Session + alle bisherigen Steps, baut Kontextstring.
- Nutzt Lovable AI Gateway (`google/gemini-3-flash-preview`) via `LOVABLE_API_KEY`.
- System-Prompt beschreibt Rolle (Problem-Framing-Facilitator) und den aktuellen Schritt.
- Antwort ausschließlich JSON: `{ "vorschlaege": string[] }` (bzw. bei Sailboat/2×2 stepspezifische Felder in gleicher Form).
- CORS + JWT-Check + Zod-Validierung, 402/429 sauber durchreichen.

## 6. Challenge-Statement-Generator

Nach Abschluss Schritt 10:
- Zweite Edge Function `framing-generate-challenge` liest gesamten State, gibt strukturiertes JSON zurück:
  ```json
  { "titel": "...", "challenge_statement": "...", "zielgruppe": "...",
    "erfolgsmessung": "...", "sprintFragen": ["..."], "risiken": ["..."] }
  ```
- UI zeigt das Ergebnis editierbar (Textarea + Felder), User "Sign-off".

## 7. Definition of Done

Auf einer finalen "Abschluss"-Seite Checkliste (nicht editierbar, wird aus State abgeleitet):
- Challenge Statement bestätigt (User-Checkbox)
- Scope klar (In/Out beide ≥1) – aus Schritt 8
- Messziel definiert – aus Schritt 7
- Decider bestätigt (Input-Feld)
- Rekrutierung ≥5 Testnutzer:innen angestoßen (Checkbox mit Notiz)

Button **"Workshop abschließen & Sprint anlegen"** aktiv, wenn alle 5 erfüllt.
Klick → erzeugt Sprint via bestehendem `useCreateSprint` mit:
- `titel` ← generierter Titel
- `problemstellung` ← finales Challenge Statement
- speichert `resulting_sprint_id` auf der Framing-Session, setzt Status `done`
- navigiert zu `/sprint/:id`.

## 8. Hooks

Neu `src/hooks/useFraming.tsx`:
- `useMyFramingSessions()`, `useFramingSession(id)`, `useFramingSteps(id)`
- `useCreateFramingSession()`, `useSaveFramingStep(id)`, `useSetFramingCurrentStep(id)`
- `useFramingSuggest()` (invokes Edge Function), `useGenerateChallenge()`

## 9. Sprint-Dashboard-Erweiterung

`SprintDashboard.tsx`: neue Sektion „Problem-Framing-Workshops" (aktive/abgeschlossene) über der Sprint-Liste, mit „Weiterarbeiten" bzw. „Sprint öffnen" (wenn `resulting_sprint_id`).

## 10. Nicht enthalten (bewusst)

- Team-Modus für Framing (nur Solo-Owner in v1)
- Export als PDF (kann später analog zu `sprint-day-summary-pdf`)
- Admin-Integration im Admin-Dashboard (kann in Folge-Iteration ergänzt werden)

## Technische Notizen

- Timer: rein clientseitig via `useEffect` + `setInterval`, State pro Schritt in `sessionStorage` (überlebt Reload, kein DB-Roundtrip).
- Alle Edge Functions in `supabase/config.toml` mit `verify_jwt = false` NICHT nötig – Default ok; JWT im Header wird in Function validiert.
- Wiederverwendung: `SprintStepCard`s Muster (Vorschläge/eigene/Kontext) wird in `FramingStepCard` refaktoriert; kein Refactor des bestehenden `SprintStepCard`.
- Neue Tabellen brauchen komplette GRANT + RLS-Blöcke in EINER Migration.
