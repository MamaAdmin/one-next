## Ziel

Im Abschluss-Schritt („Abschluss & Challenge Statement") sollen KI-generierte Sprint-Fragen und Risiken **blau** (accent-Style) dargestellt werden – analog zu allen anderen Framing-Schritten. Zusätzlich sollen darunter **separate Eingabemasken** stehen, in denen Nutzer eigene Sprint-Fragen und Risiken (neutral, nicht blau) ergänzen können.

Die Schritte 1–9 zeigen KI-Antworten bereits blau (`border-accent/60 bg-accent-soft` via `AcceptedKiList` bzw. NUF-Karte) – dort ist nichts zu ändern.

## Umsetzung in `src/components/framing/FramingCompletionPanel.tsx`

**1. State erweitern**
- Neue lokale State-Arrays: `ownSprintFragen: string[]` und `ownRisiken: string[]`.
- Beide werden zusammen mit `result` in `localStorage` unter `framing-result-<sessionId>` persistiert (erweitertes Payload-Objekt), damit nichts verloren geht.

**2. Sprint-Fragen-Sektion (aktuell Zeilen 332–385)**
- Aufteilen in zwei Blöcke:
  - **„KI-Vorschläge"** – rendert `result.sprintFragen` als blaue Karten im Stil von `AcceptedKiList` (border-accent/60 + bg-accent-soft, Sparkles-Icon). Editierbar bleibt (Textarea mit `bg-background/60`), Entfernen via ✕.
  - **„Eigene Sprint-Fragen"** – rendert `ownSprintFragen` mit normalen (neutralen) Inputs + „+ Eigene Frage hinzufügen"-Button.

**3. Risiken-Sektion (aktuell Zeilen 386–434)**
- Analog aufteilen in blaue KI-Liste (`result.risiken`) und neutrale eigene Liste (`ownRisiken`) mit „+ Eigenes Risiko hinzufügen"-Button.

**4. Speichern beim Sprint-Anlegen (`handleFinish`, Zeilen 121–197)**
- Beim Update/Insert in `sprints`: `sprint_fragen: [...result.sprintFragen, ...ownSprintFragen]` und `risiken: [...result.risiken, ...ownRisiken]` (beide Trim + Leere entfernen).

**5. Reset-Verhalten**
- Beim erneuten Generieren wird nur `result` überschrieben; `ownSprintFragen`/`ownRisiken` bleiben erhalten.
- Beim „Workshop wieder öffnen" bleiben die eigenen Einträge ebenfalls bestehen.

## Nicht betroffen
- `FramingStepCard.tsx`, alle Steps 1–9 (bereits blau).
- Datenbank / Edge Function (`framing-generate-challenge`) – Payload-Struktur bleibt gleich.
