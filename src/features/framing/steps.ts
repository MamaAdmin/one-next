export type FramingVariant =
  | "context-list" // 1
  | "two-fields" // 2
  | "stakeholder" // 3
  | "sailboat" // 4
  | "five-whys" // 5
  | "assumptions" // 6
  | "success-constraints" // 7
  | "scope-questions" // 8
  | "nuf" // 9
  | "next-steps"; // 10

export interface FramingStepDef {
  key: string;
  index: number; // 1..10
  title: string;
  frage: string;
  arbeit: string;
  timeboxMin: number;
  variant: FramingVariant;
  nutztDatenAus: string[];
}

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
    title: "2. Warum jetzt? & Default Future",
    frage: "Warum jetzt – und was passiert, wenn wir NICHTS tun?",
    arbeit: "Dringlichkeit beschreiben und ein realistisches Bild der 'Zukunft ohne Handeln' zeichnen.",
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
    title: "5. Root Cause & Cynefin",
    frage: "5 Whys – welche Ursachen sind adressierbar?",
    arbeit: "Ursachenkette vertiefen und jede Ursache nach Cynefin einordnen.",
    timeboxMin: 20,
    variant: "five-whys",
    nutztDatenAus: ["1", "2", "3", "4"],
  },
  {
    key: "6",
    index: 6,
    title: "6. Annahmen & Risiken",
    frage: "Welche Annahmen sind hoch-unsicher UND hoch-wirksam?",
    arbeit: "Annahmen sammeln und in 2×2-Matrix nach Unsicherheit × Einfluss einordnen.",
    timeboxMin: 20,
    variant: "assumptions",
    nutztDatenAus: ["1", "2", "3", "4", "5"],
  },
  {
    key: "7",
    index: 7,
    title: "7. Erfolg & Constraints",
    frage: "Woran messen wir Erfolg in 5 Tagen – was ist gesetzt?",
    arbeit: "Messbares 5-Tages-Ergebnis definieren und harte Randbedingungen festhalten.",
    timeboxMin: 20,
    variant: "success-constraints",
    nutztDatenAus: ["3", "4"],
  },
  {
    key: "8",
    index: 8,
    title: "8. Scope-Cut & Sprint-Fragen",
    frage: "Was gehört rein, was raus – welche Entscheidungsfragen klärt der Sprint?",
    arbeit: "In/Out of Scope trennen und Sprint-Fragen als 'Können wir …?' formulieren.",
    timeboxMin: 25,
    variant: "scope-questions",
    nutztDatenAus: ["5", "6", "7"],
  },
  {
    key: "9",
    index: 9,
    title: "9. Priorisierung (NUF)",
    frage: "Welche Challenge ist Neu, Nützlich und Machbar?",
    arbeit: "Sprint-Fragen nach Neuheit, Nutzen, Machbarkeit bewerten und Top-1 wählen.",
    timeboxMin: 15,
    variant: "nuf",
    nutztDatenAus: ["8"],
  },
  {
    key: "10",
    index: 10,
    title: "10. Entscheidung & Next Steps",
    frage: "Sprint-Go? Was muss vorher passieren?",
    arbeit: "Sprint-Go bestätigen und Pre-Sprint-To-dos festhalten.",
    timeboxMin: 15,
    variant: "next-steps",
    nutztDatenAus: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  },
];

export function getFramingStep(key: string): FramingStepDef | undefined {
  return FRAMING_STEPS.find((s) => s.key === key);
}

export const FRAMING_TOTAL_MIN = FRAMING_STEPS.reduce((a, s) => a + s.timeboxMin, 0);
