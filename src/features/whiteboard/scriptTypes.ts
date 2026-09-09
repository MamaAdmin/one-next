export interface ScriptTypeOption {
  value: string;
  label: string;
  ablauf: string;
  promptHinweis: string;
}

export const SCRIPT_TYPES: ScriptTypeOption[] = [
  {
    value: "problem_loesung",
    label: "Problem–Lösung",
    ablauf: "Problem → Folgen → Lösung → Nutzen → Handlungsaufruf",
    promptHinweis:
      "Beginne mit dem Problem und seinen Folgen, zeige dann die Lösung, den Nutzen und schliesse mit einem Handlungsaufruf.",
  },
  {
    value: "how_to",
    label: "How-to / Tutorial",
    ablauf: "Ziel → Voraussetzungen → nummerierte Schritte → Ergebnis",
    promptHinweis:
      "Nenne zuerst Ziel und Voraussetzungen, dann klar nummerierte Schritte und am Ende das Ergebnis.",
  },
  {
    value: "story",
    label: "Story-driven",
    ablauf: "Figur → Hindernis → Entscheidung → Erfolg",
    promptHinweis:
      "Erzähle die Geschichte einer konkreten Person mit Hindernis, Entscheidung und Erfolg.",
  },
  {
    value: "was_ist",
    label: "Was ist …?",
    ablauf: "Begriff → Einordnung → Beispiel → Merksatz",
    promptHinweis:
      "Erkläre einen Begriff: Definition, Einordnung, ein anschauliches Beispiel und ein Merksatz.",
  },
  {
    value: "vorher_nachher",
    label: "Vorher–Nachher",
    ablauf: "Ausgangslage → Veränderung → Ergebnis",
    promptHinweis: "Stelle die Ausgangslage der Veränderung gegenüber und zeige das Ergebnis.",
  },
  {
    value: "mythos_fakt",
    label: "Mythos–Fakt",
    ablauf: "Irrtum → Korrektur → Begründung → Handlung",
    promptHinweis:
      "Starte mit einem verbreiteten Irrtum, korrigiere ihn, begründe die Korrektur und leite eine Handlung ab.",
  },
  {
    value: "daten",
    label: "Daten / Infografik",
    ablauf: "Leitfrage → Kennzahl → Vergleich → Interpretation → Konsequenz",
    promptHinweis:
      "Arbeite mit einer Leitfrage, konkreten Kennzahlen, einem Vergleich und der Konsequenz daraus.",
  },
  {
    value: "fallstudie",
    label: "Fallstudie / Testimonial",
    ablauf: "Situation → Herausforderung → Lösung → Ergebnis",
    promptHinweis:
      "Beschreibe einen realistischen Kundenfall mit Herausforderung, Lösung und messbarem Ergebnis.",
  },
  {
    value: "demonstration",
    label: "Demonstration",
    ablauf: "Zeigen → kommentieren → Varianten und Fehler → Ergebnis",
    promptHinweis:
      "Zeige eine Handlung Schritt für Schritt, kommentiere sie und weise auf typische Fehler hin.",
  },
  {
    value: "compliance",
    label: "Compliance / Unterweisung",
    ablauf: "Regel → Risiko → korrektes Verhalten → Wissenscheck",
    promptHinweis:
      "Nenne die Regel, das Risiko bei Missachtung, das korrekte Verhalten und schliesse mit einer Kontrollfrage.",
  },
  {
    value: "microlearning",
    label: "Microlearning",
    ablauf: "Ein Lernziel → eine Erklärung → ein Beispiel → eine Frage",
    promptHinweis:
      "Bleibe bei genau einem Lernziel, einer Erklärung, einem Beispiel und einer Abschlussfrage. Sehr knapp.",
  },
];

export const scriptTypeOption = (value?: string | null): ScriptTypeOption =>
  SCRIPT_TYPES.find((s) => s.value === value) ?? SCRIPT_TYPES[0];

export const scriptTypeLabel = (value?: string | null): string => scriptTypeOption(value).label;
