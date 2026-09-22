# Eckige, dezente Buttons und ruhigere Icons

## Ziel
Alle Schaltflächen wirken ruhig und eckig, mit feinem hellblauem Rand. Farbige Karten behalten ihre Farbe. Icons verlieren Farbverläufe und Glanz.

## Was sich ändert

### 1. Navigation
- Menüpunkte und Schaltflächen in der Kopfzeile ohne abgerundete Ecken.
- Feiner hellblauer Rand, Hintergrund bleibt unverändert (weiss-transparent).
- Kein Farbwechsel beim aktiven Punkt ausser einer dezenten Randbetonung.

### 2. Schaltflächen allgemein
- Standardform überall eckig statt abgerundet (auch die grossen Varianten).
- Bestehendes Prinzip "dünner hellblauer Rand, transparenter Hintergrund" bleibt.
- Die Schaltfläche "Termin vereinbaren" bleibt inhaltlich und farblich wie sie ist, wird nur eckig.

### 3. Startseiten-Karten "Expertise" und "Effizienz"
- Die runden Pillen-Schaltflächen in beiden Karten werden eckig.
- Die Karten behalten ihre Flächenfarben (helle Karte, dunkle Karte); die Schaltflächen behalten ihre jeweilige Lesbarkeit auf hellem bzw. dunklem Grund.

### 4. Icons dezenter
- Farbverlaufs-Flächen und Leuchteffekte hinter Icons werden durch eine ruhige, einfarbige helle Fläche mit feinem Rand ersetzt.
- Icon-Linien in gedecktem Blau statt kräftiger Signalfarbe.
- Betroffen sind die Icon-Kacheln auf Leistungs-, Sprint- und Über-uns-Seiten sowie in den Startseiten-Abschnitten.

## Nicht betroffen
- Inhalte, Texte, Bilder, Reihenfolge der Abschnitte.
- Karten- und Flächenfarben, Buchungsdialoge, Rollen- und Navigationslogik.

## Technische Details
- `src/components/ui/button.tsx`: `rounded-md` in Basis und Grössen `sm`/`lg` auf `rounded-none`; Varianten bleiben sonst unverändert.
- `src/components/ui/Navbar5.tsx`: Dropdown-Container und Einträge auf eckige Kanten, Rand `border-border-accent`, Hover ohne Flächenfüllung.
- `src/components/ValueCards.tsx`: `rounded-full` der beiden Karten-Buttons entfernen; auf der dunklen Karte Randfarbe weiter aus der Fläche ableiten.
- Icon-Kacheln: `bg-gradient-primary` und `shadow-glow` in `src/components/Services.tsx`, `src/components/Applications.tsx`, `src/components/AIDesignSprint.tsx`, `src/pages/AIDesignSprint.tsx`, `src/pages/AIConsultingServices.tsx`, `src/pages/CustomAIDevelopment.tsx`, `src/pages/DesignSprintWorkshop.tsx`, `src/pages/OnlineSprintLanding.tsx`, `src/pages/AboutUs.tsx`, `src/pages/sprint/SprintNew.tsx` durch `bg-accent-soft border border-border-accent text-primary` ersetzen, eckig.
- Prüfung: `npx tsgo --noEmit` sowie Sichtprüfung Startseite und Leistungsseiten auf Desktop und Smartphone.
