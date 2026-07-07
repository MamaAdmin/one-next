export type FramingVariant =
  | "intro" // 0 – Erklärung / How-To vor Schritt 1
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
  nutzen?: string;
  timeboxMin: number;
  variant: FramingVariant;
  nutztDatenAus: string[];
}

// Hinweis: `key` bleibt stabil (Datenmigration-freundlich), `index` wird für die
// Navigation verwendet. Nach Schritt 5 wurde `5b` (Cynefin) eingeschoben.
export const FRAMING_STEPS: FramingStepDef[] = [
  {
    key: "intro",
    index: 0,
    title: "So arbeitest du hier",
    frage: "Wie funktionieren Eigene Anmerkungen, KI-Vorschläge und Recherche?",
    arbeit:
      "Kurze Einführung in die Arbeitsweise: eigene Gedanken, KI-Vorschläge im Tool und optionale Recherche mit externen KI-Tools.",
    timeboxMin: 0,
    variant: "intro",
    nutztDatenAus: [],
  },
  {
    key: "1",
    index: 1,
    title: "1. Kick-off & Zielbild",
    frage: "Was ist der Kontext – und was ist ausdrücklich KEIN Sprint-Ziel?",
    arbeit:
      "Beschreibe kurz die Ausgangslage und grenze ab, was NICHT Gegenstand des Sprints sein soll.",
    nutzen:
      "Damit dein Team ab jetzt vom gleichen Ausgangspunkt startet und du später keine Diskussionen über den Scope neu aufmachen musst.",
    timeboxMin: 15,
    variant: "context-list",
    nutztDatenAus: [],
  },

  {
    key: "2",
    index: 2,
    title: "2. Gegenwart, Vergangenheit & Zukunft",
    frage: "Wo stehen wir heute, was ist bereits passiert – und was erwartet uns, wenn wir NICHTS tun?",
    arbeit:
      "Gegenwart (Warum jetzt?), Vergangenheit (bisher Versuchtes / Erfahrungen) und Zukunft (Standard-Zukunft + Wettbewerb, Trends, Chancen) sichtbar machen.",
    nutzen:
      "Damit klar wird, warum jetzt der richtige Zeitpunkt für diesen Sprint ist – und du erkennst, was passiert, wenn ihr nichts ändert.",
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
    nutzen:
      "Damit du weißt, für wen du löst und wessen Meinung im Sprint zählt – bevor du dich in Details verlierst.",
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
    nutzen:
      "Um Treiber, Bremsen, Ziel und Risiken in einem Bild zu sehen, statt sie über zehn Meetings verstreut zu sammeln.",
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
      "Ursachenkette mit 5 Whys vertiefen und die relevanten Ursachen als Liste festhalten.",
    nutzen:
      "Damit du am echten Problem arbeitest, nicht am Symptom – sonst löst der Sprint das Falsche.",
    timeboxMin: 15,
    variant: "five-whys",
    nutztDatenAus: ["1", "2", "3", "4"],
  },
  {
    key: "6",
    index: 6,
    title: "6. Annahmen & Risiken",
    frage: "Welche Annahmen sind hoch-unsicher UND hoch-wirksam?",
    arbeit: "Annahmen sammeln und in 2×2-Matrix nach Unsicherheit × Einfluss einordnen.",
    nutzen:
      "Damit du erkennst, welche unsicheren Annahmen das ganze Vorhaben killen können – genau die musst du im Sprint testen.",
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
    nutzen:
      "Damit am Ende des Sprints messbar ist, ob er sich gelohnt hat – und du weißt, was du nicht anfassen darfst.",
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
    nutzen:
      "Um den Sprint auf eine bearbeitbare Frage einzudampfen, statt fünf Themen halb zu bearbeiten.",
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
    nutzen:
      "Damit du auf die eine Frage fokussierst, die neu, nützlich und machbar ist – nicht auf die lauteste.",
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
    nutzen:
      "Damit das Framing verbindlich in einen Sprint mündet und nicht als Dokument in der Ablage liegen bleibt.",
    timeboxMin: 15,
    variant: "next-steps",
    nutztDatenAus: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],

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
