export type FramingVariant =
  | "intro" // 0 – Erklärung / How-To vor Schritt 1
  | "context-list" // 1
  | "two-fields" // 2
  | "stakeholder" // 3
  | "sailboat" // 4
  | "five-whys" // 5  – Root Cause (5 Whys + Ursachen sammeln)
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
  pausenHinweis?: string;
}

// Hinweis: `key` bleibt stabil (Datenmigration-freundlich), `index` wird für die
// Navigation verwendet.
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
    title: "1. Kick-off, Langfristziel & Abgrenzung",
    frage: "Wo wollt ihr in zwei Jahren stehen – und was ist ausdrücklich KEIN Sprint-Ziel?",
    arbeit:
      "Langfristziel in einem Satz formulieren ('In zwei Jahren wird …'), Ausgangslage kurz beschreiben und abgrenzen, was NICHT Gegenstand des Sprints ist.",
    nutzen:
      "Das Langfristziel ist der Bezugspunkt für alles Weitere: Sprint-Fragen sind die Risiken auf dem Weg dorthin.",
    timeboxMin: 15,
    variant: "context-list",
    nutztDatenAus: [],
  },

  {
    key: "2",
    index: 2,
    title: "2. Gegenwart, Vergangenheit & Zukunft",
    frage: "Warum jetzt, was habt ihr schon versucht – und was passiert, wenn ihr nichts tut?",
    arbeit:
      "Gegenwart (Warum jetzt?), Vergangenheit (bisher Versuchtes und was daraus wurde) und Zukunft (Standard-Zukunft, Wettbewerb, Trends, Chancen) sichtbar machen.",
    nutzen:
      "Hier entsteht das Material, aus dem Schritt 4 Treiber, Bremsen und Risiken zieht.",
    timeboxMin: 15,
    variant: "two-fields",
    nutztDatenAus: ["1"],
  },
  {
    key: "3",
    index: 3,
    title: "3. Stakeholder & Zielgruppe",
    frage: "Wer ist beteiligt, wer ist primäre Zielgruppe – wen parkt ihr?",
    arbeit:
      "Stakeholder sammeln, primäre Zielgruppe festlegen, sekundäre bewusst parken, heutige Workarounds und Pain/Gain festhalten.",
    nutzen:
      "Die primäre Zielgruppe steht später im ersten Satz des Challenge Statements.",
    timeboxMin: 15,
    variant: "stakeholder",
    nutztDatenAus: ["1", "2"],
  },
  {
    key: "4",
    index: 4,
    title: "4. Smart Sailboat (Verdichtung)",
    frage: "Wind, Anker, Hafen, Eisberg – stimmt das Bild?",
    arbeit:
      "Die Felder sind aus den Schritten 1 bis 3 vorbefüllt. Prüfen, streichen, umformulieren, höchstens ergänzen. Keine neue Sammelrunde.",
    nutzen:
      "Ein Bild statt drei Listen – und der Ausgangspunkt für die Ursachensuche in Schritt 5.",
    timeboxMin: 30,
    variant: "sailboat",
    nutztDatenAus: ["1", "2", "3"],
  },
  {
    key: "5",
    index: 5,
    title: "5. Root Cause (5 Whys)",
    frage: "Welches Symptom seht ihr – und was steckt wirklich dahinter?",
    arbeit:
      "Zuerst das beobachtete Symptom in einem Satz festhalten. Darauf aufbauend fünfmal 'Warum?' fragen und die adressierbaren Ursachen markieren.",
    nutzen:
      "Ohne festen Startsatz wird die Ursachenkette beliebig. Die markierte Ursache landet im Challenge Statement.",
    timeboxMin: 15,
    variant: "five-whys",
    nutztDatenAus: ["1", "3", "4"],
  },
  {
    key: "6",
    index: 6,
    title: "6. Annahmen & Risiken",
    frage: "Welche Annahmen sind hoch-unsicher UND hoch-wirksam?",
    arbeit: "Annahmen sammeln und in der 2×2-Matrix nach Unsicherheit × Einfluss einordnen.",
    nutzen:
      "Die Annahmen oben rechts sind das, was der Sprint testen muss – und die Risiken im Challenge Statement.",
    timeboxMin: 20,
    variant: "assumptions",
    nutztDatenAus: ["1", "2", "3", "4", "5"],
    pausenHinweis:
      "Guter Zeitpunkt für eine Pause. Der Workshop ist hier etwa zur Hälfte durch, alles bis hierher ist gespeichert.",
  },
  {
    key: "7",
    index: 7,
    title: "7. Constraints & Rahmenbedingungen",
    frage: "Was ist gesetzt und darf im Sprint nicht angefasst werden?",
    arbeit:
      "Harte Randbedingungen festhalten: Budget, Technik, Zeit, Recht und Compliance, Team.",
    nutzen:
      "Constraints begrenzen den Lösungsraum, bevor ihr ihn in Schritt 8 zuschneidet.",
    timeboxMin: 20,
    variant: "success-constraints",
    nutztDatenAus: ["1", "3", "4"],
  },
  {
    key: "8",
    index: 8,
    title: "8. Scope-Cut & Sprint-Fragen",
    frage: "Was gehört rein, was raus – welche Entscheidungsfragen klärt der Sprint?",
    arbeit:
      "In/Out of Scope trennen und Sprint-Fragen als 'Können wir …?' formulieren, jeweils in fünf Tagen entscheidbar.",
    nutzen:
      "Um den Sprint auf eine bearbeitbare Frage einzudampfen, statt fünf Themen halb zu bearbeiten.",
    timeboxMin: 25,
    variant: "scope-questions",
    nutztDatenAus: ["1", "4", "5", "6", "7"],
  },
  {
    key: "9",
    index: 9,
    title: "9. Priorisierung (NUF) & Erfolgsmessung",
    frage: "Welche Frage kommt zuerst – und woran merkt ihr, dass sie beantwortet ist?",
    arbeit:
      "Die Sprint-Fragen aus Schritt 8 nach Neu, Nützlich und Realisierbar bewerten, die Top-1 wählen und dafür ein messbares Fünf-Tages-Ergebnis definieren.",
    nutzen:
      "Die Erfolgsmessung hängt an der gewählten Frage – deshalb erst hier und nicht vorher.",
    timeboxMin: 15,
    variant: "nuf",
    nutztDatenAus: ["1", "6", "8"],
  },
  {
    key: "10",
    index: 10,
    title: "10. Entscheidung & Next Steps",
    frage: "Sprint-Go? Was muss vorher passieren?",
    arbeit: "Sprint-Go bestätigen und Pre-Sprint-To-dos mit Verantwortlichen und Terminen festhalten.",
    nutzen:
      "Damit das Framing verbindlich in einen Sprint mündet und nicht als Dokument liegen bleibt.",
    timeboxMin: 15,
    variant: "next-steps",
    nutztDatenAus: ["1", "3", "4", "5", "6", "7", "8", "9"],

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
