

## Plan: Kursmodule-Struktur basierend auf dem Leitfaden-Dokument

### Kontext

Das hochgeladene Dokument "KI im Scheidungsrecht" hat eine klare Modulstruktur:
- **Teil 1** — Der KI-Werkzeugkasten (mit Unter-Abschnitten 1.1–1.4)
- **Teil 2** — Schritt-für-Schritt (Schritte 1–4)
- **Teil 3** — Tokens & Kosten
- **Teil 4** — Datenschutz (mit Unter-Abschnitten 4.1–4.3)
- **Teil 5** — Workflow & Vorgehen (Phasen 1–3)
- **Anhang** — Links, Checkliste, Glossar

Diese Struktur soll als wiederverwendbares Eingabeformat für alle Kurse dienen.

### Umsetzung

#### 1. Neue Datenbanktabelle `public_course_modules`

Speichert die Module/Teile eines Kurses in strukturierter Form:

```sql
CREATE TABLE public_course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public_courses(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,           -- z.B. "Der KI-Werkzeugkasten"
  module_type TEXT NOT NULL DEFAULT 'content',  -- content, steps, checklist, glossary, faq
  content_html TEXT,             -- WYSIWYG-Inhalt
  items JSONB DEFAULT '[]',     -- Strukturierte Unter-Einträge (Sub-Sections, Steps, Glossar-Einträge)
  youtube_url TEXT,              -- Optionales Video pro Modul
  icon TEXT,                     -- Optional: Icon-Name
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Das `items`-JSONB-Feld erlaubt flexible Unter-Strukturen:
- Für "Werkzeugkasten": `[{title: "Claude", description: "...", details: [...]}]`
- Für "Schritte": `[{step: 1, title: "Accounts anlegen", items: [...]}]`
- Für "Glossar": `[{term: "Token", definition: "..."}]`
- Für "Checkliste": `[{label: "OCR geprüft", checked: false}]`

RLS: Öffentlich lesbar (SELECT true), Admin kann alles (ALL mit has_role check).

#### 2. Admin-Dashboard erweitern (`PublicCourseDashboard.tsx`)

Neuer Bereich "Module" unterhalb der Kurs-Auswahl:
- Modul-Liste mit Drag-and-Drop Sortierung (sort_order)
- "Neues Modul" Dialog mit:
  - Titel-Eingabe
  - Typ-Auswahl (Inhalt, Schritte, Checkliste, Glossar)
  - WYSIWYG-Editor für `content_html`
  - Dynamisches Items-Formular je nach Typ
  - YouTube-URL Feld
- Bearbeiten/Löschen pro Modul

#### 3. Hook `usePublicCourseModules` erstellen

Neuer Hook in `src/hooks/usePublicCourses.tsx`:
- `loadModules(courseId)` — Module laden
- `addModule()` / `updateModule()` / `deleteModule()` — CRUD
- `reorderModules()` — Sortierung ändern

#### 4. Kurs-Detailseite (`KursDetail.tsx`) erweitern

Module werden als strukturierte Sektionen unterhalb der Beschreibung angezeigt:
- Jedes Modul als eigene Section mit Titel und Nummer
- Content-Module: HTML-Inhalt rendern
- Schritte-Module: Nummerierte Schrittliste mit Tabellen
- Glossar: Alphabetische Begriffsliste
- Checkliste: Interaktive Checkbox-Liste
- Info-Boxen und Warnungen aus dem Dokument als farbige Cards

#### 5. Kurs-Daten für "KI im Scheidungsrecht" einfügen

Den bestehenden Kurs mit den 6 Modulen aus dem Dokument befüllen (per Insert-Tool).

### Technische Details

- **Tabelle**: `public_course_modules` mit FK zu `public_courses`, CASCADE delete
- **JSONB `items`**: Flexibles Schema für verschiedene Modultypen — kein separates Schema pro Typ nötig
- **RLS**: Public SELECT, Admin ALL
- **Admin UI**: Module-Section im bestehenden Dashboard, unterhalb von Termine/Anmeldungen im 3-Spalten-Grid
- **Frontend-Rendering**: Switch-Case basierend auf `module_type` für unterschiedliche Darstellungen

