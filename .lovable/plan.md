# Seite „Individuelle KI-Entwicklung" als eigenen Punkt schärfen

## Ziel
Die Seite `/custom-ai-development` führt nicht mehr mit BMAD als Titel, sondern mit dem sicheren KI-Arbeitsablauf: wie Mensch und KI verlässlich zusammenarbeiten – mit Daten, Rollen, Prüfungen und menschlicher Freigabe. BMAD bleibt als Planungsmethode ein Abschnitt innerhalb der Seite, nicht die Headline. Navigation und Prozessstrip erhalten den passenden Punkt.

## Neue Tonalität
- **Navigationspunkt:** „KI-Arbeitsablauf entwickeln" (statt „Individuelle KI-Entwicklung")
- **Hero-Headline:** „Einen sicheren KI-Arbeitsablauf entwickeln"
- **Hero-Untertitel:** „Daten, Rollen, Prüfungen und menschliche Freigabe."
- **Hero-Beschreibung:** führt vom validierten Lösungsansatz zum erprobaren Arbeitsablauf; BMAD wird nicht im Titel, sondern als Planungsmethode erwähnt.
- **BMAD** wird zum Abschnitt „Planung mit BMAD" innerhalb der Seite, nicht zum Seitenversprechen.

## Änderungen an `src/pages/CustomAIDevelopment.tsx`
1. **Hero**
   - `hero_title`-Default: „Einen sicheren KI-Arbeitsablauf entwickeln".
   - Untertitel: „Daten, Rollen, Prüfungen und menschliche Freigabe."
   - `hero_description`-Default umformulieren: weg vom „BMAD-Blueprint" als Versprechen, hin zum erprobaren Arbeitsablauf mit Verantwortung; BMAD als Planungsmethode benannt.
   - Badge bleibt „Der nächste Schritt"; Badge-Icon von `GitBranch` auf `ShieldCheck` (sicherer Ablauf).
   - Facts anpassen: z. B. „Rollen & Freigabe", „Daten & Prüfungen", „Roadmap & Übergabe" (statt „BMAD / Methode").
2. **Prozessschritt 03** im Seiten-Abschnitt „Ein zusammenhängender Prozess"
   - Titel „BMAD-Integration" → „KI-Arbeitsablauf planen".
   - Beschreibung/Ergebnis so umformulieren, dass BMAD als Methode der Planung genannt wird, nicht als Ergebnis.
3. **Abschnitt „Was ist BMAD?"** umbenennen in „Planung mit BMAD":
   - Übertitel, Heading und Einleitung erhalten; BMAD wird als Methode zur Planung des Arbeitsablaufs eingeordnet.
   - Die drei Blueprint-Bausteine (PRD, Architektur, User Stories) bleiben als Planungs-Methode erklärt.
4. **Abschnitt „BMAD-Blueprint" (die 7 Module)** umbenennen in „Planungsbausteine mit BMAD"; Übertitel/Heading anpassen.
5. **Abschnitt „Gemeinsame Ausarbeitung"** bleibt; Jira/Confluence-Übergabe bleibt.
6. **Abschluss-CTA** „Bereit für Ihren BMAD-Blueprint?" → „Bereit für Ihren sicheren KI-Arbeitsablauf?"; Begleitungs-Link bleibt.
7. **SEO / strukturierte Daten**
   - `title`: „Sicherer KI-Arbeitsablauf entwickeln | one-next".
   - `description`/`keywords`: BMAD als Methode, nicht als Headline-Begriff; Fokus auf Arbeitsablauf, Rollen, Freigabe, Erprobung.
   - `createServiceSchema`-Name/Beschreibung und Breadcrumb-Name auf „KI-Arbeitsablauf entwickeln" anpassen.

## Navigation
- `src/components/Navigation.tsx`: Fallback-Label „Individuelle KI-Entwicklung" → „KI-Arbeitsablauf entwickeln"; `serviceMeta`-Beschreibung bleibt „3 · Einen sicheren KI-Arbeitsablauf entwickeln".
- Datenbankgesteuerte Navigation: Navigations-Item für `/custom-ai-development` per Migration/SQL auf Label „KI-Arbeitsablauf entwickeln" aktualisieren (URL bleibt `/custom-ai-development`).

## Prozessdefinition (`src/config/OfferProcess.ts`)
- Schritt 03 `service`: „Individuelle KI-Entwicklung" → „KI-Arbeitsablauf".
- `linkLabel`: „KI-Entwicklung ansehen" → „KI-Arbeitsablauf ansehen".
- Titel/Frage/Beschreibung/Ergebnis bleiben (passen bereits).

## Querverweise angleichen
- `src/pages/DesignSprintWorkshop.tsx`: „Weiter zur KI-Entwicklung" → „Weiter zum KI-Arbeitsablauf".
- `src/pages/OnlineSprintLanding.tsx`: „Weiter zur KI-Entwicklung" → „Weiter zum KI-Arbeitsablauf".
- `src/pages/AIConsultingServices.tsx`: Eintrag „Individuelle KI-Entwicklung" → „KI-Arbeitsablauf"; Beschreibung von „BMAD-Blueprint und umsetzungsreifer High-Level-Plan" auf sicheren Arbeitsablauf umformulieren.
- `src/components/WorkshopRegistrationForm.tsx`: Auswahloption „Individuelle KI-Entwicklung" → „KI-Arbeitsablauf entwickeln" (Konsistenz).
- `public/llms.txt`: Beschreibung der Seite auf sicheren KI-Arbeitsablauf anpassen.

## Nicht verändert
- URL `/custom-ai-development` bleibt.
- Preise, Workshop-Dauern, Buchungswege, BMAD-Portal, Datenbankstrukturen, Backend-Funktionen bleiben unangetastet.
- Visueller Stil (Cream & Slate, Hellblau-Rahmen, Workshop-Typografie, Bild, Layout) bleibt wie bei Problem Framing/Design Sprint.
- Die 7 BMAD-Module als Inhalt bleiben erhalten, nur als Planungsabschnitt eingeordnet.

## Qualitätssicherung
- Typprüfung und Build ohne Fehler.
- Sichtprüfung Desktop und Smartphone: Headline, Prozessstrip (Schritt 3 aktiv), BMAD-Abschnitt als Planung, Navigation, Links.
- Querverweise und Navigationslabel konsistent prüfen.
- Vollständigen Diff zeigen.
