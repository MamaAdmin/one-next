
# Memory-Aufräumung „One-next"

Ziel: `mem://index.md` und die referenzierten Memory-Dateien so kompakt und aktuell machen, dass jede neue Session mit einem sauberen, tokensparenden Kontext startet — ohne Detailwissen zu verlieren.

## Was passiert

### 1. Core-Regeln (immer im Prompt) — straffen & ergänzen
Bleiben (Kurzform):
- Sprache: durchgängig **KI** statt „AI" (Ausnahmen: etablierte Fachbegriffe).
- Kontakt: `info@one-next.com`, keine Telefonnummern (Ausnahme: Twint-Checkout).
- Externe Links/Dokumente: immer neuer Tab.
- Nav-Sichtbarkeit: rollenexklusiv, max. 3 Ebenen.
- Auth-Mails via Supabase, Business-Mails via Resend.
- Brand-Logo: `one-next-logo-new.png` (`h-[2.1rem]`), verlinkt Homepage.
- Überschriften/Buttons in Satzschreibweise, kein Denglisch, kein Lorem Ipsum.

Neu ergänzen (Core):
- **Stack:** React 18 + Vite + TS + Tailwind + shadcn; Backend = Lovable Cloud (Supabase). Dateinamen PascalCase.
- **Design-Tokens statt Hardcoded Colors** (semantische Tokens in `index.css`).
- **RLS-Pflicht** + `GRANT` auf jede public-Tabelle; Rollen in eigener Tabelle (`user_roles` + `has_role`).

### 2. Neue Memory-Dateien anlegen
- `mem://technical/tech-stack` — Stack, Ordnerstruktur, zentrale Verzeichnisse.
- `mem://features/framing-sprint-flow` — Framing-Session → Sprint-Übergang: Status-Werte (`active`, `aktiv`, `abgeschlossen`), `current_step`, `resulting_sprint_id`, Completion-Panel-Logik (Definition of Done sperrt nach Abschluss; Zielgruppe/Erfolgsmessung/Sprint-Fragen vor Abschluss generierbar + regenerierbar).
- `mem://features/feature-map` — kompakte Landkarte: LMS, Public Courses, Blog, Framing/Sprint, BMAD-Portal, Admin, Zahlungen (Stripe + Twint).
- `mem://conventions/code-standards` — TS strict-Ziel, kein `any`, kein `console.log` in App-Code, `fetch` nur via `src/services/`, React Query für Server-State, Tailwind statt Inline-Styles, Named Exports, Kommentare Englisch / UI Deutsch.
- `mem://pitfalls/known-traps` — `noUnusedLocals` bricht Build hart; `(supabase as any)` = fehlende generierte Types (Reihenfolge: Types regenerieren → strict → Casts weg); Auto-generierte Dateien (`client.ts`, `types.ts`, `.env`, `config.toml`) nie editieren; Schemas `auth/storage/realtime/…` tabu.

### 3. Bestehende Memories konsolidieren
- Zusammenführen: `blog-magazine-layout` + `blog-placeholder-strategy` + `blog-design-konsistenz` + `blog-image-architecture` → **eine** `mem://features/blog` Datei.
- Zusammenführen: `stripe-twint-checkout` + `payment-promotion-codes` + `payment-success-flow` + `stripe-product-architecture` → **eine** `mem://features/payments` Datei.
- Zusammenführen: `role-definitions` + `navigation-access-rules` + `bmad-portal-system` → **eine** `mem://auth/roles-and-access` Datei.
- Zusammenführen: `public-course-platform` + `admin-data-visibility-pattern` + `public-course-design-standard` + `public-course-modules-architecture` → **eine** `mem://features/public-courses` Datei.

### 4. Index neu schreiben
`mem://index.md` wird nach der Konsolidierung deutlich kürzer: ~8–10 Core-Zeilen + ~12 Memory-Referenzen (statt aktuell 27). Jede Referenz behält eine spezifische Ein-Zeilen-Beschreibung, damit die Relevanz-Erkennung weiter funktioniert.

## Was NICHT passiert
- Kein Code wird angefasst.
- Keine DB-Änderungen.
- Keine Feature-Regeln inhaltlich geändert — nur zusammengefasst und umsortiert.

## Ergebnis
Neue Chats starten mit ~40 % weniger Memory-Ballast im Prompt, alle wichtigen Regeln bleiben abrufbar, Framing/Sprint-Wissen (das bisher nur im Chat lebte) ist persistent.
