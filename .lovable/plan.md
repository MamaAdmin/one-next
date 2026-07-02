
## Neue Sektion "Unsere Trainingslocation" auf `/about-us`

Fügt eine neue Sektion in `src/pages/AboutUs.tsx` ein, platziert zwischen "Unser Ansatz" und der CTA-Section.

### Bildvorbereitung
Die zwei hochgeladenen Fotos (Meetingraum tagsüber, Kaminecke mit Apéro) via `imagegen--edit_image` behutsam an den Look der übrigen Website-Bilder angleichen: leichte Kühlung, dezente Blautöne, gleichmäßigere Helligkeit — keine harten Filter, natürlich bleiben.
- `src/assets/training-location-room.jpg` (Meetingraum)
- `src/assets/training-location-cozy.jpg` (Kaminszene / Apéro)

### Sektions-Aufbau
- Überschrift: **"Unsere Trainingslocation"**, Untertitel: "Cosy Training mitten im Grünen"
- **Zwei-Spalten-Bildgrid** (`md:grid-cols-2`), beide Bilder `rounded-2xl shadow-elegant`
- **Einleitungstext:** Workshops mit **max. 6 Personen** — für fokussierte Zusammenarbeit. Wir nutzen unsere eigenen Räume, kommen zu Ihnen vor Ort oder organisieren auf Wunsch eine passende Location in Kundennähe.
- **Highlight-Block "Cosy Training bei uns"**: Start am Nachmittag im lichtdurchfluteten Meetingraum, Abschluss mit **Apéro & Fireside Talk** am Kamin — Reflexion der Erkenntnisse mitten im Grünen mit Blick in die Berge.
- **Drei kleine Feature-Cards** (Icons `Users`, `Home`, `Flame` aus lucide-react, alle `text-primary`, konsistent mit "Unsere Werte"):
  - Max. 6 Personen — fokussierte Intensität
  - Eigene Räume, bei Ihnen oder in Kundennähe
  - Apéro & Fireside Talk zum Abschluss

### Technische Details
- Alles inline in `AboutUs.tsx` — keine neuen Komponenten.
- Design-Tokens konsistent: `bg-background/50` (alternierendes Sektionsmuster einhalten), `shadow-elegant`, `text-primary`, `Card`/`CardContent`.
- Zwei neue Bild-Imports aus `@/assets/`.
- Keine Backend- oder Routing-Änderungen.
