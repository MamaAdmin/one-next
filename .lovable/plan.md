# ValueCards: weg von Deko-Stock zu erzählenden Bildern

Der rosa Sektions-Hintergrund und die 3D-Objekt-Stockbilder (Ei, Pyramiden, pinkes Podest) wirken beliebig und lenken ab. Die Sektion soll ruhig werden und die Bilder sollen echte Inhalte tragen, nicht dekorieren.

## Grundhaltung
- Sektionshintergrund: **kein Rosa mehr**, sondern das warme Sand-Neutral der Seite (`bg-background`) mit dünnem Divider oben/unten.
- Karten-Farbflächen (Beige/Schwarz/Gold) bleiben als Ankerpunkte, aber ruhiger, mit kleinerem Radius (`rounded-2xl`), einheitlichem Padding.
- Bilder sind **inhaltlich**, nicht dekorativ. Einheitlicher Look: leicht entsättigt (0.9), warmes Farbklima passend zum Sand-Hintergrund, keine 3D-Renderings, keine pastelligen Studio-Sets.

## Bild-Konzept — drei Optionen zur Wahl

Ich schlage drei kohärente Bildstile vor. Wir wählen einen und ich generiere/kuratiere alle drei Bilder in diesem Stil, damit die Sektion visuell aus einem Guss ist.

### Option A — Menschen bei der Arbeit (dokumentarisch)
Reportage-Fotos aus Workshops und Sprint-Sessions: Post-its an der Wand, Hände am Whiteboard, konzentrierte Gesichter im Halbprofil, Laptops mit Skizzen, gebrauchte Kaffeetassen. Warm, körnig, natürliches Licht. Sagt sofort: „Hier passiert echte Arbeit mit echten Menschen." Passt zu Expertise/Erfolg.
Referenz: IDEO-Case-Studies, Frog Design, Ammunition Group.

### Option B — Architektonische Ruhe (editorial-still)
Ruhige, fast fotografische Studien: großer weißer Raum mit einem einzelnen Objekt, Papierstapel im Streiflicht, Detail einer Post-it-Wand aus der Nähe (abstrakte Farbfelder), eine geöffnete Notebook-Seite. Kein Mensch, aber Spuren von Denken. Sehr editorial, wie eine Kinfolk/Cereal-Doppelseite.
Referenz: Kinfolk, Apartamento, Aesop Journal.

### Option C — Abstrakt-typografisch (Studio-Manifesto)
Statt Fotos: großformatige typografische Kacheln — ein einziges Wort oder eine Zahl in Serif, viel Weißraum, warme Papier-Textur. „01 Sprint", „48h Prototyp", „12 Wochen". Wirkt wie Manifest-Poster einer Design-Agentur. Kein Foto-Rauschen, maximale Klarheit.
Referenz: Pentagram, Base Design, Bureau Borsche.

## Struktur nach dem Umbau

Layout bleibt Bento-artig, aber ruhiger:

```text
┌───────────────┬───────────────────────────────┐
│ Expertise     │  Bild 1 (großformatig)        │
│ (Text-Karte)  │                               │
├───────────────┼───────────────┬───────────────┤
│  Bild 2       │ Effizienz     │ Erfolg        │
│               │ (schwarz)     │ (Gold, ruhig) │
└───────────────┴───────────────┴───────────────┘
```

- 3 Text-Karten (Expertise, Effizienz, Erfolg) bleiben inhaltlich unverändert.
- Statt 3 Deko-Bildern nur **2 bewusste Bilder** — weniger ist mehr.
- Karten-Radius auf `rounded-2xl` (passt zum neuen globalen Radius), einheitliche `p-8 md:p-10`.
- Karten-Palette: Sand (Expertise, statt aktuelles Beige `bg-secondary`), Schwarz (Effizienz), dezenteres Gold (Erfolg) — Gold-Ton leicht entsättigen, damit er nicht mehr senffarben wirkt.
- Buttons: konsistent `rounded-full` bleibt, aber Rand kräftiger (`border-strong`), keine Hex-Farben mehr.

## Betroffene Dateien
- `src/components/ValueCards.tsx` — Layout, Farben, Bildeinbindung.
- `src/assets/` — je nach Option: neue Bilder generieren (imagegen) im gewählten Stil, alte 3D-Assets `geometric-paper.jpg`, `decorative-egg.jpg`, `pink-podium.jpg` entfernen.
- `src/index.css` — keine Änderung nötig; nutzt bestehende Tokens.

## Nicht Teil dieses Schritts
- Weitere Sektionen (About, Services, Footer).
- Textliche Neuformulierung der Inhalte.
- Neue Business-Logik.

## Entscheidung nötig
**Welche Bildrichtung soll ich umsetzen — A, B oder C?** Sag mir die Option, dann baue ich die Sektion um und generiere die passenden Bilder im gewählten Stil.
