# Plan: HMW-Vorschläge starten immer mit „Wie können wir …"

## Problem
Schritt **1.4 HMW — How Might We** generiert aktuell freie Vorschläge. Sie sollen als echte HMW-Fragen formuliert sein und mit „Wie können wir …" beginnen, mit Fragezeichen enden.

## Änderung (genau eine Datei)

`supabase/functions/sprint-ai-suggest/index.ts`

1. **Step-spezifische Zusatz-Anweisung** im `systemPrompt`: wenn `step_key === "1.4"`, eine zusätzliche Regel anhängen:
   - „Jeder Vorschlag MUSS als HMW-Frage formuliert sein, exakt mit `Wie können wir ` beginnen und mit `?` enden. Keine Aussagen, keine Aufzählungen, kein anderer Satzanfang."
2. **Server-seitige Normalisierung** in der Response-Verarbeitung (nur für `step_key === "1.4"`), damit auch Modell-Ausreißer korrekt ankommen:
   - Trim, führende Bullet-/Nummerierungs-Präfixe entfernen (`- `, `• `, `1. `).
   - Wenn nicht mit „Wie können wir " (case-insensitive) beginnend → Präfix voranstellen, ersten Buchstaben nach dem Präfix klein schreiben.
   - Wenn nicht mit `?` endend → `?` anhängen (Punkt am Ende ggf. ersetzen).
   - Leere/zu kurze Einträge (< 8 Zeichen Inhalt) verwerfen.

Kein Client-Code, keine DB, keine anderen Schritte betroffen. Response-Shape (`{ vorschlaege: string[] }`) bleibt identisch.

## Verifikation
1. In `/sprint/:id` Schritt **1.4** öffnen, „Vorschläge generieren" klicken.
2. Alle Vorschläge beginnen mit „Wie können wir " und enden mit „?".
3. Stichprobe in einem anderen Schritt (z. B. 1.1, 1.5): Vorschläge bleiben unverändert in ihrer freien Form.

Soll ich das umsetzen?
