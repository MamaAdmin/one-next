# Hintergrundmusik: hochladen oder verlinken

Heute gibt es im Editor nur ein Textfeld für eine Musik-Adresse. Künftig soll man eine
Musikdatei direkt hochladen können — und weiterhin eine Adresse einfügen.

## Zur Pixabay-Seite

Der Link, den du geschickt hast, ist eine Webseite, keine Musikdatei. Solche Seiten lassen
sich nicht direkt ins Video einbinden. Vorgehen: bei Pixabay auf „Download“ tippen, die
MP3 speichern und im Editor hochladen. Pixabay-Musik ist für solche Videos kostenfrei
nutzbar, eine Quellenangabe ist freiwillig.

## Was gebaut wird

- Im Bereich „Vorschau“ wird aus dem einen Feld ein kleiner Musik-Block:
  - Knopf „Musik hochladen“ (MP3, WAV, M4A, OGG; max. 20 MB)
  - weiterhin ein Feld für eine direkte Musik-Adresse
  - kleiner Abspieler zum Reinhören und ein „Entfernen“-Knopf
  - Lautstärkeregler (0–60 %), bisher fest bei 18 %
- Hinweis unter dem Upload: Pixabay-Seiten bitte erst herunterladen, dann hochladen.
- Fehlermeldungen auf Deutsch bei falschem Dateityp oder zu grosser Datei.

## Technische Umsetzung

- Neue Datei `src/features/whiteboard/music.ts`: Validierung, Upload nach
  `whiteboard-uploads` unter `music/<videoId>/…`, signierte URL (analog `clips.ts`).
  Kein neuer Bucket, keine neue Migration nötig.
- Neue Komponente `src/components/admin/MusicPicker.tsx` (Upload, Adresse, Abspieler,
  Lautstärke).
- `WhiteboardVideoEditor.tsx`: Musikfeld durch `MusicPicker` ersetzen; speichert
  `music_url`, `music_volume` und zusätzlich den Speicherpfad.
- Damit hochgeladene Musik nach Ablauf der signierten Adresse weiter funktioniert:
  Spalte `music_path` in `whiteboard_videos` (Migration, nullable) und beim Laden
  eine frische signierte Adresse holen — analog zu `clipPath`.
- Serien-Detailseite bleibt unverändert; die Wiedergabe in `WhiteboardVideo.tsx`
  (Audio-Spur mit `musicVolume`, Ducking) ändert sich nicht.

## Nicht angefasst

Remotion-Renderer, Bild-/Ton-Erzeugung über kie-whiteboard, Serien-Datenmodell.
