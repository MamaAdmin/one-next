## Änderungen auf der Design-Sprint-Workshop-Seite

Die meisten geforderten Änderungen (AI→KI, Expert/Facilitator-Begriffe, Footer-Tagline, Headline-Text) wurden in vorigen Durchgängen bereits umgesetzt. Es verbleiben drei konkrete Anpassungen:

### 1) `src/pages/DesignSprintWorkshop.tsx`
- **Zeile 275–283**: Den Button "Pick Agenda" (inkl. Calendar-Icon und onClick zum externen Gamma-Dokument) im Block "Tag 1: Verstehen & Definieren" vollständig entfernen. Das umgebende Flex-Layout der Überschriftzeile wird beibehalten.
- **Zeile 610**: "Facilitierter 2-Tage Workshop mit KI-Experten vor Ort oder remote" → "Moderierter 2-Tage-Workshop mit KI-Experten vor Ort oder remote".

### 2) `src/pages/AIDesignSprint.tsx`
- **Zeile 403**: "Facilitierter 2-Tage Workshop mit KI-Experten" → "Moderierter 2-Tage-Workshop mit KI-Experten".

### Bereits umgesetzt (keine Aktion nötig)
- Headline "Bereit für Ihren KI Design Sprint Workshop?" steht vollständig im Code (Z. 596–599). Die visuelle Abschneidung war ein reines Render-Artefakt; an dem Text ist nichts zu ändern.
- "Geleitet von KI-Experten und erfahrenen Moderatoren mit KI-Tools …" (Z. 56) ist bereits gesetzt.
- Footer-Tagline in `src/components/Footer.tsx` (Z. 35) entspricht bereits dem geforderten neuen Wortlaut.
- Alle übrigen AI→KI- und Expert-/Facilitator-Begriffe auf der Seite sind bereits umgesetzt (per `rg` verifiziert).

Am Ende der Implementierung folgt die geforderte Änderungs-Liste.