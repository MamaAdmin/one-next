## Ziel
Die aufklappbaren Topic-Abschnitte (CanvasSection) sollen deutlicher als klickbar erkennbar sein: eigenes Icon, akzentuierte Farbe und Hover-Feedback.

## Änderung in `src/components/framing/CanvasSection.tsx`

- Chevron-Icon (`ChevronRight` aus `lucide-react`) links vor dem Titel; rotiert per `group-open:rotate-90` beim Öffnen.
- Text "öffnen" / "schließen" rechts erhalten, aber in der Primärfarbe (`text-primary`) mit `font-medium` statt gedämpftem Grau — klare visuelle Handlungsaufforderung.
- Header selbst: `hover:bg-muted/60` und `text-foreground` statt `text-muted-foreground`, damit der ganze Balken erkennbar klickbar wirkt.
- Border wird beim Öffnen dezent zur Primärfarbe (`group-open:border-primary/40`), damit klar ist, welcher Abschnitt aktiv ist.
- Icon und Text-Label per Flex sauber ausrichten, Padding leicht erhöhen für bessere Klickfläche.

## Nicht Teil dieser Änderung
- Kein Umbau der KI-Vorschläge, der Feldinhalte oder anderer Schritte.
- Keine Änderung an CanvasSection-Aufrufern — API bleibt identisch (`title`, `children`).