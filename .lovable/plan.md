## Ziel

Public Courses erscheinen zukünftig in der LMS Kursverwaltung (`/admin/lms/courses`). Jeder Kurs bekommt einen Flag **Public** / **Nicht public**. Der bestehende Public-Kurs "KI als Werkzeug im Scheidungsrecht" wird verknüpft, bleibt aber datenkompatibel (Termine, Registrierungen, Stripe Price).

## Vorgehen

### 1. Datenbank
Migration:
- Neue Spalten in `lms_courses`:
  - `is_public boolean not null default false` — der neue Flag
  - `public_course_id uuid` FK auf `public_courses(id)` (nullable) — Verknüpfung zu bestehenden public-course-Daten (Termine, Registrierungen, Module, stripe_price)
- Migrationsstep: Für jeden Datensatz in `public_courses` einen entsprechenden `lms_courses`-Datensatz einfügen (falls noch nicht via slug vorhanden), mit `is_public = true`, `visibility = 'public'`, `is_active`, Titel, Beschreibung, Bild, Preis, Slug und `public_course_id` gesetzt.

### 2. LMS Kursverwaltung UI (`LMSCourseDashboard.tsx` + `CourseEditor`)
- Neue Spalte "Sichtbarkeit" in der Kurs-Tabelle mit Badge:
  - **Public** (grün) wenn `is_public = true`
  - **Nicht public** (grau) sonst
- Neuer Filter im Header: „Alle / Public / Nicht public".
- Im `CourseEditor` ein Switch **Public Kurs** hinzufügen (schaltet `is_public`).
- Wenn `is_public = true` und `public_course_id` gesetzt: unterhalb des Editors ein Button „Termine & Anmeldungen verwalten" → verlinkt auf `/admin/kurse` mit vorausgewähltem Kurs (via query param `?course=<id>`).

### 3. Public Course Dashboard
- Bleibt unter `/admin/kurse` verfügbar für Termine, Registrierungen, Public-Module und Stripe-Preis (Daten die nicht in `lms_courses` liegen).
- Unterstützt `?course=<publicCourseId>` als vorausgewählte Auswahl.
- Zusätzlich: neuer Link/Hinweis oben "Kurs-Grunddaten werden jetzt in der LMS Kursverwaltung gepflegt".

### 4. Hooks
- `useLMSCourse` erweitern: `is_public` und `public_course_id` in Select/Update aufnehmen.
- Kein Bruch an bestehenden Public-Course-Routes (`/kurs/:slug`) — nutzen weiterhin `public_courses`-Tabelle.

## Technisches

- Migration erstellt `is_public`, `public_course_id`, Index, und synchronisiert bestehende Public Courses in `lms_courses`.
- Typescript-Types werden nach Migration regeneriert; Code-Änderungen erfolgen danach.
- Keine Änderungen an RLS-Policies (bestehende Admin-Policy deckt die neuen Spalten ab). SELECT-Policy erweitern, damit `is_public = true` auch für anon sichtbar wäre — **nicht** nötig, da öffentliche Ansicht über `public_courses` läuft.

## Nicht Teil dieser Änderung
- Migration von Modulen (`public_course_modules` → `lms_course_modules`): unterschiedliche Strukturen, würde separate Umstellung erfordern.
- Frontend `/kurs/:slug` bleibt unverändert.
