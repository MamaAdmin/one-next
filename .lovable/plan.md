# Einsatzorte für Videos und Bildbibliothek

## 1. «Einsatzort» statt «Einsatzort im Workshop»
- Das Feld heisst überall nur noch **«Einsatzort»** (im YouTube-Bereich des Video-Editors und in der Videobibliothek).
- Die Auswahl ist nach Bereichen gruppiert, damit sie übersichtlich bleibt:
  - **Webseite**: z. B. Startseite, Problem-Framing-Workshop (Einstieg), Leistungsseiten
  - **Problem-Framing-Workshop**: Einführung, Team-Konstellation, Schritte 1–10
  - **Design Sprint**: Einführung
  - **Eigene Einsatzorte**: alle neu angelegten (siehe Punkt 2)
- Jeder Eintrag zeigt die Seite, auf der das Video erscheint.

## 2. Widget «Einsatzort hier anlegen» (nur für Admins)
- Angemeldete Admins sehen auf **jeder Seite** unten rechts einen kleinen Knopf «Video-Einsatzort».
- Klick öffnet ein kleines Fenster:
  - Name des Einsatzorts (z. B. «Startseite · unter dem Prozess»)
  - Seite wird automatisch übernommen
  - Position auf der Seite: **oben** (unter dem Seitenkopf) oder **unten** (vor der Fusszeile)
  - optional direkt ein Video aus der Bibliothek zuweisen
- Das Fenster listet auch die bereits angelegten Einsatzorte dieser Seite: umbenennen, Video wechseln, löschen.
- Ist einem eigenen Einsatzort ein Video zugewiesen, erscheint es für alle Besucher an der gewählten Position. Ohne Video bleibt die Stelle für Besucher unsichtbar.
- Die neuen Einsatzorte erscheinen sofort auch in der Auswahl «Einsatzort» (Video-Editor, Videobibliothek).
- Die bestehenden, fest eingebauten Einsatzorte funktionieren unverändert weiter.

## 3. Referenzbild-Bibliothek
- Neuer Bereich im Admin-Dashboard: **«Bildbibliothek»**.
- Zeigt als Galerie alle bisher erzeugten Bilder aus den Whiteboard-Videos und Lernvideos sowie hochgeladene Referenzbilder.
- Pro Bild: Vorschau, Bildbeschreibung, aus welchem Video/welcher Szene es stammt, Datum.
- Suche nach Text und Filter nach Video bzw. Stil.
- Aktionen: gross ansehen, Link kopieren, **«Als Referenzbild verwenden»**.
- Im Video-Editor gibt es neben «Referenzbild hochladen» neu **«Aus Bibliothek wählen»**, damit ein bestehendes Bild den Look eines neuen Videos vorgibt.
- Neu erzeugte Bilder landen ab jetzt automatisch in der Bibliothek. Bereits vorhandene Bilder werden einmalig übernommen.

## Technische Details
- Neue Tabelle `video_placements` (id, slot_key unique, label, page_path, position `top|bottom`, created_by, timestamps). GRANT + RLS: lesen für alle (anon, authenticated), schreiben nur `has_role(auth.uid(),'admin')`.
- `src/features/video/slots.ts`: `VIDEO_SLOTS` erhält `group` (`website|framing|sprint`); neuer Hook `useAllVideoSlots()` vereint feste Slots + `video_placements` (Gruppe `custom`). `YouTube.tsx` und `VideoLibraryManager.tsx` nutzen den Hook mit `SelectGroup`/`SelectLabel`; Label «Einsatzort».
- Neue Komponenten `PlacementWidget.tsx` (Admin-Floating-Button + Dialog, nur bei `useAdmin`) und `PagePlacements.tsx` (rendert Videos für `location.pathname` und Position via vorhandenen Video-Player), beide global in `App.tsx` innerhalb des Routers. Position «oben» als Block direkt unter der Navigation, «unten» vor dem Footer – umgesetzt über einen Wrapper um die Routen.
- Neue Tabelle `image_library` (id, url, storage_path, prompt, source `whiteboard|lernvideo|upload`, video_id, scene_index, style, created_at). GRANT + RLS nur Admin/content_manager. Insert nach erfolgreicher Bilderzeugung in `kie-whiteboard` (Service Role) und beim Referenzbild-Upload; einmaliges Backfill-Skript aus `whiteboard_videos.scenes` (imageUrl).
- Neue Seite `src/pages/admin/ImageLibrary.tsx` + Route + Eintrag im Admin-Dashboard; Auswahldialog im `WhiteboardVideoEditor` setzt die Stilreferenz-URL.
- Signierte URLs mit Ablauf: Bibliothek speichert `storage_path` und erzeugt bei Anzeige frische Links.
