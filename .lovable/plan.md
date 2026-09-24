# Fertige Videos auf YouTube veröffentlichen und im Problem Framing einbinden

## Was ihr bekommt
- Einmalig: im Admin-Bereich „YouTube-Kanal verbinden“ – Anmeldung mit dem Google-Konto des Kanals (UC80BITjnvjLmBTnPh6yYVog). Danach muss nichts mehr eingegeben werden.
- Im Whiteboard-Video-Editor und im Lernvideo-Editor: Auswahlfeld „Einsatzort im Workshop“ (z. B. „Problem Framing · Schritt 3“, „Einstieg“, „Team-Konstellation“ – dieselbe Liste wie in der Video-Bibliothek).
- Sobald der Server-Export (MP4) fertig ist, erscheint der Knopf „Auf YouTube veröffentlichen“. Titel und Beschreibung sind vorausgefüllt und änderbar.
- Nach dem Hochladen: Video ist **öffentlich** auf eurem Kanal, wird automatisch in die Video-Bibliothek eingetragen und dem gewählten Einsatzort zugeordnet – es erscheint also sofort an der richtigen Stelle im Problem Framing (ersetzt das bisherige Video an diesem Platz).
- Status sichtbar: „Wird hochgeladen“, „Veröffentlicht“ mit Link zu YouTube, oder verständliche Fehlermeldung (z. B. Tageslimit von YouTube erreicht).

## Was ihr liefern müsst
YouTube erlaubt Uploads nur mit eigener Google-Freigabe. Dafür braucht es einmalig in der Google Cloud Console:
1. Projekt anlegen, „YouTube Data API v3“ aktivieren.
2. OAuth-Zugang (Webanwendung) erstellen, die Weiterleitungsadresse eintragen, die ich euch nach dem Bau nenne.
3. Client-ID und Client-Secret sicher im Formular hinterlegen (nicht im Chat).
Hinweis: Solange Google die App nicht geprüft hat, setzt YouTube Uploads von ungeprüften Apps teilweise auf „privat“. Für öffentliche Uploads ist ein Prüfantrag bei Google nötig (ich erkläre den Ablauf).

## Technische Details
- Secrets: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`.
- Tabelle `youtube_connection` (admin-only, RLS + GRANT): channel_id, refresh_token (nur Service-Rolle lesbar), verbunden_am.
- Spalten auf `whiteboard_videos` und `projects`: `target_slot_key`, `youtube_video_id`, `youtube_status`, `youtube_error`.
- Edge Functions: `youtube-oauth-start` / `youtube-oauth-callback` (Refresh-Token speichern, Kanal-ID prüfen), `youtube-publish` (Admin-geprüft; lädt MP4 aus privatem Speicher, resumable Upload an YouTube, privacyStatus `public`, optional SRT als Untertitelspur; danach `video_library` upsert mit `https://youtu.be/{id}` für den Slot).
- UI: Slot-Auswahl + Veröffentlichen-Panel im Export-Bereich von `WhiteboardVideoEditor.tsx` und `TimelineStudio.tsx`; Verbindungskarte in der Video-Bibliothek-Verwaltung.
