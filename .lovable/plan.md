# Whiteboard-Videos: Stile, deutsche Bildbeschreibungen und Kie.ai-Credit-Monitoring

## Antworten auf deine Fragen

**Warum Englisch?** Das Skript fordert bewusst einen englischen `imagePrompt` an, weil Bildmodelle englische Beschreibungen zuverlässiger umsetzen. Der Stil-Zusatz („black ink whiteboard marker line drawing…") wird zusätzlich fest angehängt.

**Briefing vs. Abschnitte:** Das Briefing ist die Eingabe, aus der die KI Skript, Zeichnungen und Stimme erzeugt; die Abschnitte unten sind das Ergebnis. Nach der Erzeugung wirkt es doppelt – wird daher kompakt zusammengeklappt.

**Stile heute:** Genau ein fest einprogrammierter Stil – schwarze Strichzeichnung auf weissem Grund (Bilder) bzw. „Whiteboard animation style" (KI-Videoclip). Keine Auswahl.

**Was über Kie.ai zusätzlich möglich ist:** weitere Bildstile (Bunte Marker, Bleistift-Skizze, Kreide auf Tafel, Comic, flache Business-Illustration, Fotorealistisch), weitere Stimmen, Veo-Videoclips.

**Flow Kie.ai ↔ Remotion:** Kie.ai liefert die Bausteine (Skript-Text, Zeichnungen, Sprachdateien, optional KI-Clip). Remotion setzt daraus im Browser das Video zusammen – Titel, Abschnitte, zeichnende Hand, Ton – und exportiert die MP4.

**Credits:** exakte Werte sind konfigurierbar (siehe Preisverwaltung unten); Richtwerte: Skript sehr günstig, Bilder pro Stück moderat, Sprache nach Zeichen, Veo-Clip mit Abstand am teuersten.

## Teil A – Generator-Verbesserungen

1. **Stil-Auswahl** (Dropdown neben „Stimme"): Strichzeichnung s/w (Standard), Bunte Marker, Bleistift-Skizze, Kreide auf Tafel, Comic, Flache Business-Illustration. Wird pro Video gespeichert und bei jeder Bilderzeugung angewendet.
2. **Deutsche Bildbeschreibungen:** `imagePrompt` künftig auf Deutsch; der englische Stil-Zusatz bleibt intern.
3. **Briefing verschlanken:** Karte wird kompakt/einklappbar, sobald Abschnitte existieren.

## Teil B – Kie.ai Credit-Monitoring

**Guthaben abrufen:** Neue Aktion `credits` in der bestehenden Server-Funktion ruft `GET https://api.kie.ai/api/v1/chat/credit` mit dem bereits hinterlegten Schlüssel auf. Der Schlüssel bleibt ausschliesslich serverseitig.

**Admin-Dashboard – Karte „Kie.ai Credits":** verfügbare Credits, Zeitpunkt der letzten Aktualisierung, Button „Credits aktualisieren", Warnung unter 500, kritische Warnung unter 100.

**Preisverwaltung „Kie.ai Modelle und Preise":** Tabelle mit Modellname, Kategorie (Text/Bild/Sprache/Video), Einheit (Auftrag/Bild/1.000 Zeichen/Sekunde), Credits pro Einheit, aktiv/inaktiv, zuletzt aktualisiert. Nichts wird im Frontend fest verdrahtet; die Schätzung liest immer diese Werte.

**Vor der Generierung:** Guthaben abrufen, erwartete Kosten aus den konfigurierten Preisen berechnen, anzeigen („Geschätzter Verbrauch: ca. 85 Credits · Verfügbar: 2.460"). Reicht das Guthaben nicht, startet die Generierung nicht.

**Während/nach der Generierung:** je Auftrag (Skript, Bild, Sprache, Videoclip) ein eigener Protokolleintrag mit Kie.ai-`task_id` und Status. Fehlgeschlagene Aufträge zählen nicht zum Verbrauch. Nach Abschluss Guthaben erneut abrufen; `credits_used` wird primär aus der Modellkalkulation gebildet, die Kontostandsdifferenz dient nur als Kontrollwert (wichtig bei parallelen Nutzern). Negative oder unplausible Differenzen werden verworfen und markiert.

**Kostenaufschlüsselung beim Video:** Skript (Modell + Credits), Bilder (Anzahl × Credits), Sprache (Zeichen × Tarif), KI-Clips (Sekunden × Tarif), Gesamt geschätzt, Gesamt tatsächlich. Nach dem Lauf: „Dieses Lernvideo hat 82 Credits verbraucht."

**Auswertung im Admin-Dashboard:** Credits heute, letzte 7 Tage, aktueller Monat, Durchschnitt pro Video, Verbrauch nach Modell, nach Benutzer, letzte Generierungsaufträge.

**Fehlerbehandlung:** fehlender/ungültiger Schlüssel, Kie.ai nicht erreichbar, zu wenig Guthaben, Rate Limit, Abbruch, Teilfehler, negativer Verbrauch – jeweils klare deutsche Meldung, keine stillen Fehlschläge.

Bestehende Funktionen und das Design bleiben unverändert.

## Technische Details

- Migration: `kie_models` (name, category, unit, credits_per_unit, active, updated_at) mit Startdaten; `generation_usage` (id, video_id, user_id, created_at, status, script_model, image_model, voice_model, video_model, number_of_sections, number_of_images, audio_characters, video_seconds, credits_before, credits_after, estimated_credits, credits_used, error_message); `generation_jobs` (usage_id, kind, task_id, model, units, estimated_credits, status, error_message). RLS: nur Admins lesen/schreiben (`has_role`), plus GRANTs für `authenticated`/`service_role`.
- Spalte `style` auf `whiteboard_videos`.
- `supabase/functions/kie-whiteboard/index.ts`: Aktion `credits`; `style`-Parameter mit Stil-Mapping; deutscher `imagePrompt`-Prompt; Job-Protokollierung mit `task_id`; Vorab-Guthabenprüfung; einheitliche Fehlercodes.
- Frontend: `src/features/whiteboard/api.ts` + `types.ts` (Stil, Credits, Usage), `WhiteboardVideoEditor.tsx` (Stil-Dropdown, Schätzung, Aufschlüsselung, Ergebnis), neue Admin-Komponenten `KieCreditsCard.tsx`, `KieModelPricing.tsx`, `KieUsageStats.tsx`, eingebunden in `WhiteboardVideoDashboard.tsx`.
- Schlüsselname: es existiert bereits `KIE_AI_API_KEY`; er wird weiterverwendet (kein neues Secret nötig).
