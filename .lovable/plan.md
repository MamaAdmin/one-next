## Ziel

PDF-Output des Tages-One-Pagers wird auf **Server-Side Rendering** umgestellt und mit konsistentem Branding versehen.

## Architektur

```text
Client (SprintDaySummary)
   │  "PDF herunterladen" Button
   ▼
supabase.functions.invoke('sprint-day-summary-pdf', { sprintId, day })
   │
   ▼
Edge Function sprint-day-summary-pdf
   ├─ Auth-Check (JWT) + Sprint-Member-Check via has_role/is_sprint_member
   ├─ Lädt Sprint + alle sprint_steps des Tages
   ├─ Holt summary.dayN (Gemini KI-Summary) — falls fehlt: ruft intern sprint-day-summary auf
   ├─ Rendert HTML-Template (A4 mehrseitig, Brand-CSS)
   └─ HTML → PDF via Browserless/PDFShift API
   │
   ▼
Response: application/pdf (Stream)
   │
   ▼
Client: triggert Download als "OneNext_Sprint_{titel}_Tag{N}.pdf"
```

## Rendering-Engine

**Server-side via Edge Function** mit externem HTML→PDF Service.

Option für die Umsetzung: **PDFShift** (https://pdfshift.io) — einfache REST-API, ~50 free PDFs/Monat, sauberes CSS-Rendering inkl. Web Fonts, Header/Footer-Templates, Seitenzahlen.

Alternative: **Browserless.io** (Puppeteer-as-a-Service). Beide brauchen einen API-Key, der via `add_secret` gesetzt wird (`PDFSHIFT_API_KEY`).

Warum nicht Deno-internes Puppeteer: Edge Functions haben kein persistentes Filesystem für Chromium-Binaries und Cold-Starts wären zu langsam. Externer Service ist der robuste Pfad.

## PDF-Layout (A4 Hochformat, mehrseitig)

```text
┌──────────────────────────────────────────────┐
│ [Logo one-next]              [Tag N Badge]   │  ← Header (jede Seite)
│ Sprint: {titel}              {Datum}         │
├──────────────────────────────────────────────┤
│                                              │
│  EXECUTIVE SUMMARY (KI · Gemini)             │
│  ─────────────────────────────────           │
│  {3–5 Sätze Gemini Summary}                  │
│                                              │
│  KEY DECISIONS                               │
│  • Entscheidung 1                            │
│  • Entscheidung 2                            │
│                                              │
│  ──────────  SEITENUMBRUCH  ──────────       │
│                                              │
│  SCHRITTE & ANTWORTEN                        │
│                                              │
│  1.1 Schritt-Titel                           │
│  Frage: …                                    │
│  Auswahl: …                                  │
│  Antworten:                                  │
│    – Antwort A                               │
│    – Antwort B                               │
│  Notizen: …                                  │
│                                              │
│  1.2 …                                       │
│                                              │
│  ──────────  SEITENUMBRUCH  ──────────       │
│                                              │
│  MAP / VISUAL (nur Tag 1)                    │
│  [Customer Journey Map als Lane-Grid]        │
│                                              │
├──────────────────────────────────────────────┤
│ one-next.com · Generiert {Datum}   Seite x/y │  ← Footer (jede Seite)
└──────────────────────────────────────────────┘
```

### Branding-Tokens im PDF-CSS
- Primary-Farbe aus `index.css` (HSL) hart in das HTML-Template übernehmen (Edge Function kennt keine Tailwind-Theme-Tokens).
- Font: `Inter` via Google Fonts `<link>` im Template-`<head>` (vom HTML→PDF-Service unterstützt).
- Logo `one-next-logo-new.png`: aus Public-Bucket `company-logos` oder als statisches Base64 im Template (kein externer Fetch nötig).
- Tag-Badge in Primary-Farbe rechts oben.
- H1/H2 in Primary-Farbe, dünne Linien als Section-Separator.

## Inhalte je Schritt

Vollständig: `frage`, `auswahl`, `antworten[]`, `notes`, `completed_at`. Keine Schritte ausblenden. Map nur an Tag 1.

## Änderungen

### Neu
- `supabase/functions/sprint-day-summary-pdf/index.ts`
  - Validierung via Zod: `{ sprintId: uuid, day: 1..5 }`
  - Auth: JWT prüfen, `is_sprint_member` Check
  - Lädt `sprints` + `sprint_steps` (Tag N)
  - Falls `summary.dayN` fehlt → ruft Gemini-Logik inline (oder fetcht `sprint-day-summary`) auf
  - Baut HTML-String (A4-CSS mit `@page`, `@media print`, page-break-Regeln)
  - POST an PDFShift-API mit `source` (HTML), `landscape: false`, `format: 'A4'`, `margin`, `header`/`footer` Templates
  - Streamt PDF-Bytes zurück mit `Content-Type: application/pdf` + `Content-Disposition: attachment`

### Edit
- `src/components/sprint/SprintDaySummary.tsx`
  - `downloadPdf()` ruft jetzt Edge Function statt html2canvas/jsPDF
  - `supabase.functions.invoke('sprint-day-summary-pdf', { body: { sprintId, day } })`
  - Response als Blob → `URL.createObjectURL` → `<a download>`-Trigger
  - In-App-Ansicht bleibt unverändert (HTML-Vorschau wie bisher)
- `package.json` / `bun.lock`: `html2canvas` und `jspdf` entfernen (nicht mehr nötig)

### Secret
- `PDFSHIFT_API_KEY` via `add_secret` anfordern (Schritt 1 vor Implementierung)

## Offene Punkte vor Build

1. **PDFShift-Account**: Du brauchst einen Account auf https://pdfshift.io (Free Tier reicht für Tests) und gibst den API-Key beim Build-Schritt frei. Falls du lieber Browserless/PDF.co nimmst, sag Bescheid — die Function-Struktur bleibt gleich, nur der API-Call ändert sich.
2. **Logo-Quelle**: OK wenn ich das `one-next-logo-new.png` als Base64 ins Template einbette (keine externen Image-Fetches im PDF-Renderer, robuster)?

Wenn beides klar ist, baue ich die Function + den Client-Switch in einem Rutsch.