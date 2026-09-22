# Antworten aus dem Problem Framing in den Sprint übernehmen

## Ziel

Wenn im Problem Framing eine Frage bereits sinngemäss beantwortet wurde, startet der passende Sprint-Schritt nicht mehr leer: Die Antwort steht als Eintrag bereits da, ist jederzeit änder- und löschbar und trägt eine kleine Markierung „Aus Problem Framing“, die direkt zum entsprechenden Schritt im Framing führt.

## Welche Schritte werden vorbefüllt

| Sprint-Schritt | Inhalt aus dem Problem Framing |
|---|---|
| 1.1 Ziel | Langfristziel (Schritt 1) und Sailboat-Hafen (Schritt 4) |
| 1.2 Metriken | Erfolgsmessung (Schritt 9) bzw. Erfolgskriterien (Schritt 7) |
| 1.3 Risiken | Annahmen & Risiken (Schritt 6) |
| 1.4 HMW | Sprint-Fragen (Schritt 8) und die gewählte Top-1-Frage (Schritt 9) |
| 1.5 Kunden | Stakeholder und primäre Zielgruppe (Schritt 3) |

Es wird nur einmal vorbefüllt, solange der Schritt noch keine eigenen Einträge hat. Wer etwas löscht, bekommt es nicht wieder aufgedrängt. Bestehende Sprints bleiben unverändert, ausser der Schritt ist noch leer.

## Verhalten im Sprint-Schritt

- Übernommene Einträge erscheinen in derselben Liste wie eigene Einträge, voll editierbar und löschbar.
- Jeder übernommene Eintrag trägt eine unaufdringliche Markierung „Aus Problem Framing“. Ein Klick darauf öffnet das Problem Framing beim Herkunftsschritt in einem neuen Tab.
- Sobald ein Eintrag bearbeitet wird, bleibt die Markierung erhalten (Herkunft bleibt nachvollziehbar).
- Gibt es keine verknüpfte Framing-Session oder keine passenden Inhalte, ändert sich nichts am heutigen Verhalten.
- Falls der Schritt schon Einträge enthält, erscheint statt automatischer Übernahme ein kleiner Knopf „Aus Problem Framing übernehmen“, der fehlende Einträge ergänzt (keine Duplikate).

## Technische Umsetzung

- Neue Hilfsfunktion `src/features/sprint/framingSeed.ts`: bildet Framing-Schrittdaten (`framing_steps.data`) auf die Sprint-Schlüssel 1.1–1.5 ab und liefert `{ text, framingStepKey }[]`.
- Neuer Hook `useFramingForSprint(sprintId)` (z. B. in `src/hooks/useSprint.tsx` oder eigener Datei): lädt `framing_sessions` über `resulting_sprint_id = sprintId` plus deren `framing_steps`. Kein Schemawechsel nötig, die Verknüpfung existiert bereits.
- `src/features/sprint/types.ts`: `SprintStepData` erhält `herkunft?: Record<string, { quelle: "framing"; stepKey: string }>` — Schlüssel ist der Eintragstext, damit die Markierung ohne Strukturbruch an den bestehenden String-Listen hängt. Beim Umbenennen eines Eintrags wird der Schlüssel mitgeführt.
- `src/components/sprint/SprintStepCard.tsx`: Seed-Effekt analog zum bestehenden `applyMapSeed` (nur wenn `eigene`/`antworten` leer), Badge-Rendering in der Eintragsliste, Link `/sprint/framing/<sessionId>` (bestehende Framing-Route) mit `target="_blank" rel="noopener noreferrer"`, sowie der Nachtrag-Knopf im Kopfbereich des Schritts.
- Die Framing-Navigation läuft über `current_step`; der Link öffnet daher die Framing-Session und nennt den Schritt im Badge-Text („Aus Problem Framing · Schritt 6“), ohne die Framing-Navigation zu verändern.

## Nicht angefasst

Framing-Schritte, Abschlusspanel, Challenge-Statement-Erzeugung, die bestehende Feldkopie beim Framing-Abschluss und alle übrigen Sprint-Schritte.
