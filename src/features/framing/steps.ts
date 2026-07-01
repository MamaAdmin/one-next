export type FramingVariant =
  | "context-list" // 1
  | "two-fields" // 2
  | "stakeholder" // 3
  | "sailboat" // 4
  | "five-whys" // 5  – Root Cause (5 Whys + Ursachen sammeln)
  | "cynefin" // 5b – Cynefin-Klassifikation (auto-generiert aus 5)
  | "assumptions" // 6
  | "success-constraints" // 7
  | "scope-questions" // 8
  | "nuf" // 9
  | "next-steps"; // 10

export interface FramingStepDef {
  key: string;
  index: number; // 1..N (Navigation-Cursor)
  title: string;
  frage: string;
  arbeit: string;
  timeboxMin: number;
  variant: FramingVariant;
  nutztDatenAus: string[];
}

// Hinweis: `key` bleibt stabil (Datenmigration-freundlich), `index` wird für die
// Navigation verwendet. Nach Schritt 5 wurde `5b` (Cynefin) eingeschoben.
export const FRAMING_STEPS: FramingStepDef[] = [
  {
    key: "1",
    index: 1,
    title: "1. Kick-off & Zielbild",
    frage: "Was ist der Kontext – und was ist ausdrücklich KEIN Sprint-Ziel?",
    arbeit:
      "Beschreibe kurz die Ausgangslage und grenze ab, was NICHT Gegenstand des Sprints sein soll.",
    timeboxMin: 15,
    variant: "context-list",
    nutztDatenAus: [],
  },
  {
    key: "2",
    index: 2,
    title: "2. Present, Past & Future",
    frage: "Wo stehen wir heute, was ist bereits passiert – und was erwartet uns, wenn wir NICHTS tun?",
    arbeit:
      "Present (Warum jetzt?), Past (bisher Versuchtes / Erfahrungen) und Future (Default Future + Wettbewerb, Trends, Chancen) sichtbar machen.",
    timeboxMin: 15,
    variant: "two-fields",
    nutztDatenAus: ["1"],
  },
  {
    key: "3",
    index: 3,
    title: "3. Stakeholder & Zielgruppe",
    frage: "Wer ist beteiligt, wer ist primäre Zielgruppe – wen parken wir?",
    arbeit: "Stakeholder sammeln, primäre Zielgruppe festlegen, sekundäre bewusst parken.",
    timeboxMin: 15,
    variant: "stakeholder",
    nutztDatenAus: ["1", "2"],
  },
  {
    key: "4",
    index: 4,
    title: "4. Smart Sailboat",
    frage: "Wind, Anker, Hafen, Eisberg – wo stehen wir?",
    arbeit:
      "Treiber (Wind), Hindernisse (Anker), Ziel (Hafen) und Risiken (Eisberg) zusammentragen.",
    timeboxMin: 30,
    variant: "sailboat",
    nutztDatenAus: ["1", "2", "3"],
  },
  {
    key: "5",
    index: 5,
    title: "5. Root Cause (5 Whys)",
    frage: "Was steckt wirklich dahinter? – 5 Whys",
    arbeit:
      "Ursachenkette mit 5 Whys vertiefen und die relevanten Ursachen als Liste festhalten. Die Cynefin-Einordnung passiert automatisch im nächsten Schritt.",
    timeboxMin: 15,
    variant: "five-whys",
    nutztDatenAus: ["1", "2", "3", "4"],
  },
  {
    key: "5b",
    index: 6,
    title: "6. Cynefin-Einordnung",
    frage: "Welche Ursachen sind einfach, kompliziert, komplex oder chaotisch – und adressierbar?",
    arbeit:
      "Die Ursachen aus Schritt 5 werden automatisch übernommen. Klassifikation und Adressierbarkeit bei Bedarf anpassen.",
    timeboxMin: 15,
    variant: "cynefin",
    nutztDatenAus: ["5"],
  },
  {
    key: "6",
    index: 7,
    title: "7. Annahmen & Risiken",
    frage: "Welche Annahmen sind hoch-unsicher UND hoch-wirksam?",
    arbeit: "Annahmen sammeln und in 2×2-Matrix nach Unsicherheit × Einfluss einordnen.",
    timeboxMin: 20,
    variant: "assumptions",
    nutztDatenAus: ["1", "2", "3", "4", "5", "5b"],
  },
  {
    key: "7",
    index: 8,
    title: "8. Erfolg & Constraints",
    frage: "Woran messen wir Erfolg in 5 Tagen – was ist gesetzt?",
    arbeit: "Messbares 5-Tages-Ergebnis definieren und harte Randbedingungen festhalten.",
    timeboxMin: 20,
    variant: "success-constraints",
    nutztDatenAus: ["3", "4"],
  },
  {
    key: "8",
    index: 9,
    title: "9. Scope-Cut & Sprint-Fragen",
    frage: "Was gehört rein, was raus – welche Entscheidungsfragen klärt der Sprint?",
    arbeit: "In/Out of Scope trennen und Sprint-Fragen als 'Können wir …?' formulieren.",
    timeboxMin: 25,
    variant: "scope-questions",
    nutztDatenAus: ["5", "5b", "6", "7"],
  },
  {
    key: "9",
    index: 10,
    title: "10. Priorisierung (NUF)",
    frage: "Welche Challenge ist Neu, Nützlich und Machbar?",
    arbeit: "Sprint-Fragen nach Neuheit, Nutzen, Machbarkeit bewerten und Top-1 wählen.",
    timeboxMin: 15,
    variant: "nuf",
    nutztDatenAus: ["8"],
  },
  {
    key: "10",
    index: 11,
    title: "11. Entscheidung & Next Steps",
    frage: "Sprint-Go? Was muss vorher passieren?",
    arbeit: "Sprint-Go bestätigen und Pre-Sprint-To-dos festhalten.",
    timeboxMin: 15,
    variant: "next-steps",
    nutztDatenAus: ["1", "2", "3", "4", "5", "5b", "6", "7", "8", "9"],
  },
];

export function getFramingStep(key: string): FramingStepDef | undefined {
  return FRAMING_STEPS.find((s) => s.key === key);
}

export function getFramingStepByIndex(index: number): FramingStepDef | undefined {
  return FRAMING_STEPS.find((s) => s.index === index);
}

export const FRAMING_TOTAL_MIN = FRAMING_STEPS.reduce((a, s) => a + s.timeboxMin, 0);
export const FRAMING_STEP_COUNT = FRAMING_STEPS.length;
