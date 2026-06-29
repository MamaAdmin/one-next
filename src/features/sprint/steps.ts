// Central step configuration for the Online Design Sprint.
// Spec source: "Online Design Sprint" PDF.
// Etappe 1 ships the structure; specialized renderers come in later etappen.

export type SprintDay = 1 | 2 | 3 | 4 | 5;

export type SprintMode = "solo" | "team";

export interface SprintStepDef {
  /** Stable id, e.g. "1.1". Used as DB step_key. */
  key: string;
  day: SprintDay;
  /** Day label like "Tag 1 · Map" */
  dayLabel: string;
  /** Step display title, e.g. "1.1 Ziel" */
  title: string;
  /** Main question / prompt shown as the headline. */
  frage: string;
  /** Allein arbeiten / Zusammen arbeiten instruction. */
  arbeit: string;
  /** Voting instruction. */
  abstimmung?: string;
  /** Who decides. */
  entscheidung?: string;
  /** Hard vote limit for selectable checkboxes (technische Begrenzung). */
  stimmenLimit?: number;
  /** Which previous step keys feed this step's context panel + AI context. */
  nutztDatenAus: string[];
  /** Reserved for renderer specialization in later etappen. */
  variant?:
    | "checkbox-list" // default: KI-Vorschläge + eigene als Checkbox-Liste
    | "flow-3-steps" // 1.6 / 1.7
    | "map" // 1.8
    | "form" // 1.9
    | "table" // 1.10 / 1.11 / 3.5 / 3.6 / 5.4
    | "notes" // 2.2
    | "ideas" // 2.3
    | "crazy8s" // 2.4
    | "sketches" // 2.5
    | "heatmap" // 3.1
    | "storyboard" // 3.4
    | "prototype" // 4.1
    | "scorecard" // 5.1
    | "choice" // 5.2
    | "hot-takes"; // 5.3
}

export const SPRINT_STEPS: SprintStepDef[] = [
  // ===== TAG 1 — MAP =====
  {
    key: "1.1",
    day: 1,
    dayLabel: "Tag 1 · Map",
    title: "1.1 Ziel",
    frage: "Wie sieht eine perfekte Welt für die Kunden in 12–18 Monaten aus?",
    arbeit:
      "Schreibe einen Satz, der ein perfektes Ergebnis für deine Kunden beschreibt. Mutig, optimistisch, idealistisch. Keine Zahlen/Metriken. Keine Lösung vorschreiben.",
    abstimmung: "Stille Abstimmung, 2 Stimmen pro Person.",
    entscheidung:
      "Decider wählt das am besten formulierte Ziel. Kurze Diskussion, nicht am Wortlaut feilen, max. 5 Min.",
    stimmenLimit: 2,
    nutztDatenAus: ["sprint.titel", "sprint.problemstellung"],
  },
  {
    key: "1.2",
    day: 1,
    dayLabel: "Tag 1 · Map",
    title: "1.2 Metriken",
    frage: "Woran erkennen wir, dass wir unser Ziel erreicht haben?",
    arbeit:
      "1–2 Metriken. Grober Entwurf, keine Verpflichtung. Stell dir vor, alles läuft perfekt. Eine Zahl aufnehmen, ehrgeizig sein.",
    abstimmung: "Stille Abstimmung, 3 Stimmen pro Person.",
    entscheidung: "Decider wählt 2–3 Metriken.",
    stimmenLimit: 3,
    nutztDatenAus: ["1.1", "sprint.problemstellung"],
  },
  {
    key: "1.3",
    day: 1,
    dayLabel: "Tag 1 · Map",
    title: "1.3 Risiken",
    frage: "Was könnte uns davon abhalten, Ziel und Metriken zu erreichen?",
    arbeit:
      "Werde pessimistisch. Wie könnten wir scheitern? Ja/Nein-Fragen (Beginn mit „Können wir.../Werden.../Ist...").",
    abstimmung: "Stille Abstimmung, 4 Stimmen pro Person.",
    entscheidung: "Decider wählt die 2 kritischsten Risiken.",
    stimmenLimit: 4,
    nutztDatenAus: ["1.1", "1.2"],
  },
  {
    key: "1.4",
    day: 1,
    dayLabel: "Tag 1 · Map",
    title: "1.4 HMW — How Might We",
    frage: "Welche HMW-Fragen ergeben sich aus Ziel, Metriken und Risiken?",
    arbeit:
      "Fragen, zuhören, notieren. 2–4 Experten je 15–30 Min. interviewen. HMW-Notizen machen (Probleme/Ideen als „Wie könnten wir...?"-Fragen). Solo-Modus: Die KI generiert HMW-Fragen statt Experteninterviews.",
    abstimmung: "Stille Abstimmung, 5 Stimmen pro Person.",
    entscheidung: "Decider wählt die Top 3–7 HMWs.",
    stimmenLimit: 5,
    nutztDatenAus: ["1.1", "1.2", "1.3"],
  },
  {
    key: "1.5",
    day: 1,
    dayLabel: "Tag 1 · Map",
    title: "1.5 Kunden",
    frage: "Welche Kundentypen bedienen wir?",
    arbeit:
      "Ein Eintrag pro Kundentyp. Einfache Kategorien statt komplizierter Demografie. Auch Schlüsselakteure aufnehmen.",
    abstimmung: "Stille Abstimmung, 3 Stimmen pro Person.",
    entscheidung: "Decider wählt ein Set an Kundentypen (2, 3 oder mehr).",
    stimmenLimit: 3,
    nutztDatenAus: ["1.1", "sprint.problemstellung"],
  },
  {
    key: "1.6",
    day: 1,
    dayLabel: "Tag 1 · Map",
    title: "1.6 Discovery",
    frage: "Wie entdecken Kunden dieses neue Ding?",
    arbeit:
      "Wichtigsten Kundentyp wählen. 3 Schritte: Entdecken → Lernen → Starten. Möglichst wenige Worte.",
    abstimmung: "Stille Abstimmung, 1 Stimme pro Person (bester Flow).",
    entscheidung: "Decider wählt 1 Flow, kann Karten ergänzen.",
    stimmenLimit: 1,
    nutztDatenAus: ["1.5", "1.1"],
    variant: "flow-3-steps",
  },
  {
    key: "1.7",
    day: 1,
    dayLabel: "Tag 1 · Map",
    title: "1.7 Core",
    frage: "Was ist die Kernerfahrung?",
    arbeit:
      "Wichtigsten Kundentyp wählen. 3 Schritte der Kernerfahrung mit dem Produkt. Möglichst wenige Worte.",
    abstimmung: "Stille Abstimmung, 1 Stimme pro Person.",
    entscheidung: "Decider wählt 1 Flow.",
    stimmenLimit: 1,
    nutztDatenAus: ["1.5", "1.6"],
    variant: "flow-3-steps",
  },
  {
    key: "1.8",
    day: 1,
    dayLabel: "Tag 1 · Map",
    title: "1.8 Map (Gesamtkarte)",
    frage: "Wie sieht die Gesamterfahrung des Kunden aus?",
    arbeit:
      "Bereiche Kunden / Entdeckung / Kern / Ergebnis / Weitere Akteure / Zielrisiko zu einer großen Karte verbinden. Mit Pfeilen verbinden, 10–15 Schritte ideal, vereinfachen. Ergebnis = ein Ereignis, das zeigt, dass wir auf Kurs zum Ziel sind.",
    entscheidung:
      "Decider wählt das Zielrisiko (target risk) und den Zielmoment (target moment) auf der Karte – beide werden gespeichert.",
    nutztDatenAus: ["1.5", "1.6", "1.7", "1.3", "1.1", "1.2"],
    variant: "map",
  },
  {
    key: "1.9",
    day: 1,
    dayLabel: "Tag 1 · Map",
    title: "1.9 Recruit",
    frage: "Wie finden wir unsere Zielkunden?",
    arbeit:
      "Felder: Interviewer · Recruiter · Wo Kunden zu finden sind · Brauchen Kunden außer einem Laptop etwas? · Video-Link fürs Interview.",
    nutztDatenAus: ["1.5"],
    variant: "form",
  },
  {
    key: "1.10",
    day: 1,
    dayLabel: "Tag 1 · Map",
    title: "1.10 Screening",
    frage: "Welche Merkmale ein-/ausschließen? Und wie filtern wir Kandidaten?",
    arbeit:
      "Tabelle Einschließen/Ausschließen + Filtermethode (Google Forms, TypeForm, greatquestion.io ...).",
    nutztDatenAus: ["1.5", "1.9"],
    variant: "table",
  },
  {
    key: "1.11",
    day: 1,
    dayLabel: "Tag 1 · Map",
    title: "1.11 Confirmed Interviews",
    frage: "Wer wird interviewt?",
    arbeit:
      "3+ Interviews rekrutieren/bestätigen. Alle Kunden MÜSSEN dem Zielprofil aus Screening (1.10) entsprechen. Tabelle Kundenname / Interview-Zeit.",
    nutztDatenAus: ["1.10"],
    variant: "table",
  },

  // ===== TAG 2 — SKETCH =====
  {
    key: "2.1",
    day: 2,
    dayLabel: "Tag 2 · Sketch",
    title: "2.1 Lightning Demos",
    frage: "Welche analogen Lösungen können uns inspirieren?",
    arbeit:
      "Inspirierende Lösungen aus anderen Branchen sammeln (gezielt zum Zielrisiko), Favorit wählen, kurze Demo, Kernidee beschriften.",
    abstimmung: "Stille Abstimmung, 4 Stimmen pro Person (nicht bindend).",
    stimmenLimit: 4,
    nutztDatenAus: ["1.8", "1.4"],
  },
  {
    key: "2.2",
    day: 2,
    dayLabel: "Tag 2 · Sketch",
    title: "2.2 Notes",
    frage: "Was nehmen wir aus Tag 1 mit in die Skizzen?",
    arbeit:
      "Auf Papier Gedächtnis auffrischen: Ziel, Metrik, Zielrisiko aufschreiben, dann Lieblings-HMWs, Lightning Demos, Kernteile der Map.",
    nutztDatenAus: ["1.1", "1.2", "1.8", "1.4", "2.1"],
    variant: "notes",
  },
  {
    key: "2.3",
    day: 2,
    dayLabel: "Tag 2 · Sketch",
    title: "2.3 Ideas",
    frage: "Welche Ideen entstehen aus den HMWs?",
    arbeit:
      "Frei brainstormen: Antworten auf HMW-Fragen, Headlines, Doodles, Storyboards, Mindmaps. Privater Denkraum.",
    nutztDatenAus: ["1.4"],
    variant: "ideas",
  },
  {
    key: "2.4",
    day: 2,
    dayLabel: "Tag 2 · Sketch",
    title: "2.4 Crazy 8s",
    frage: "Welche 8 schnellen Varianten skizzierst du?",
    arbeit: "8 schnelle Skizzen, 1 Min. pro Skizze (Timer). Eine Idee variieren.",
    nutztDatenAus: ["2.3"],
    variant: "crazy8s",
  },
  {
    key: "2.5",
    day: 2,
    dayLabel: "Tag 2 · Sketch",
    title: "2.5 Solution Sketch",
    frage: "Wie sieht deine detaillierte Lösung für den Zielmoment aus?",
    arbeit:
      "Detaillierte Lösung für den Zielmoment zeichnen. Regeln: anonym, selbsterklärend, schwarz-weiß, „hässlich ist okay", Worte sind wichtig, vorerst geheim.",
    nutztDatenAus: ["1.8", "1.1", "1.2"],
    variant: "sketches",
  },

  // ===== TAG 3 — DECIDE =====
  {
    key: "3.1",
    day: 3,
    dayLabel: "Tag 3 · Decide",
    title: "3.1 Decide",
    frage: "Welche Lösungen sollen wir prototypisieren und testen?",
    arbeit:
      "(1) Heatmap – Punkte auf gemochte Stellen. (2) Speed-Review – 2–3 Min. pro Skizze, Cluster beschriften. (3) Straw Poll – still beste Lösung wählen + Begründung „Wir sollten X testen, weil...". (4) Decider wählt 1–3 Skizzen.",
    entscheidung: "Decider wählt die Gewinner-Skizze(n).",
    nutztDatenAus: ["2.5"],
    variant: "heatmap",
  },
  {
    key: "3.2",
    day: 3,
    dayLabel: "Tag 3 · Decide",
    title: "3.2 Hypotheses",
    frage: "Warum testen wir diese Skizzen, und was glauben wir, wird passieren?",
    arbeit:
      "Große Idee hinter den Lösungen, die Ziel/Metrik erfüllt oder Top-Risiken adressiert. 1–2 Hypothesen zum Testen.",
    abstimmung: "Stille Abstimmung, 3 Stimmen pro Person.",
    entscheidung: "Decider wählt die 2 wichtigsten Hypothesen.",
    stimmenLimit: 3,
    nutztDatenAus: ["3.1", "1.1", "1.2", "1.3", "1.8"],
  },
  {
    key: "3.3",
    day: 3,
    dayLabel: "Tag 3 · Decide",
    title: "3.3 Storyboard Flow",
    frage: "Was sind die ersten 6 Schritte deines Prototyps?",
    arbeit:
      "Mit Eröffnungsszene VOR dem Produkt beginnen, dann Screens/Klicks. Gewinner-Skizzen nutzen, nichts Neues erfinden.",
    abstimmung: "Stille Abstimmung, 1 Stimme pro Person.",
    entscheidung: "Decider wählt 1 Flow.",
    stimmenLimit: 1,
    nutztDatenAus: ["3.1", "1.6"],
  },
  {
    key: "3.4",
    day: 3,
    dayLabel: "Tag 3 · Decide",
    title: "3.4 Storyboard",
    frage: "Wie sieht das fertige Storyboard aus?",
    arbeit:
      "Gewinner-Flow als Storyboard ausarbeiten (Eröffnungsszene + Prototyp-Screens). Schnelle Entscheidungen, keine langen Diskussionen, Aufgaben verteilen.",
    nutztDatenAus: ["3.3", "3.1"],
    variant: "storyboard",
  },
  {
    key: "3.5",
    day: 3,
    dayLabel: "Tag 3 · Decide",
    title: "3.5 Prototyping Jobs",
    frage: "Wer ist wofür verantwortlich?",
    arbeit:
      "Rollen: Prototyper, Stitcher, Texter/Content-Sammler, Interviewer, Recruiter.",
    nutztDatenAus: ["1.9"],
    variant: "table",
  },
  {
    key: "3.6",
    day: 3,
    dayLabel: "Tag 3 · Decide",
    title: "3.6 Prototyping Schedule",
    frage: "Wann checken wir uns ein?",
    arbeit:
      "9:30 Start · 12:00 Team-Check-in · 15:30 Review mit Decider · 17:00 Ende. Frei editierbar.",
    nutztDatenAus: [],
    variant: "table",
  },

  // ===== TAG 4 — PROTOTYPE =====
  {
    key: "4.1",
    day: 4,
    dayLabel: "Tag 4 · Prototype",
    title: "4.1 Prototype",
    frage: "Wie bauen wir die realistische Simulation?",
    arbeit:
      "Realistische Simulation bauen / Prototyp-Screenshots einfügen. Die KI kann pro Storyboard-Screen Vorschläge für Inhalte/Texte liefern.",
    nutztDatenAus: ["3.4", "3.5", "3.6"],
    variant: "prototype",
  },

  // ===== TAG 5 — TEST =====
  {
    key: "5.1",
    day: 5,
    dayLabel: "Tag 5 · Test",
    title: "5.1 Scorecard",
    frage: "Wie bewerten wir die Tests?",
    arbeit:
      "Mit 3+ Kunden testen, die zum Zielprofil (1.10) passen (optional 4–5). Pro Frage je Kunde bewerten: grün = ja, rot = nein, „vielleicht" vermeiden. Ablauf: (1) Ansehen & abstimmen, (2) schnelle Recaps + Decider, (3) Conclusions.",
    nutztDatenAus: ["3.2", "1.3", "1.8", "1.11", "1.10"],
    variant: "scorecard",
  },
  {
    key: "5.2",
    day: 5,
    dayLabel: "Tag 5 · Test",
    title: "5.2 Entscheidung",
    frage: "Lasst es uns bauen – oder mehr lernen?",
    arbeit:
      "„Lasst es uns bauen" ODER „Lasst uns mehr lernen" (→ neuer Sprint, der Ziel/Metriken/Risiken aus diesem Sprint vorbefüllt übernimmt).",
    nutztDatenAus: ["5.1"],
    variant: "choice",
  },
  {
    key: "5.3",
    day: 5,
    dayLabel: "Tag 5 · Test",
    title: "5.3 Hot Takes",
    frage: "Was nehmen wir aus dem Sprint mit?",
    arbeit:
      "(1) Allein still ausfüllen, (2) Stille Abstimmung 5 Stimmen, (3) Diskussion 5–10 Min., (4) Decider wählt nächste Schritte.",
    stimmenLimit: 5,
    nutztDatenAus: ["1.1", "1.5", "1.10", "5.1"],
    variant: "hot-takes",
  },
  {
    key: "5.4",
    day: 5,
    dayLabel: "Tag 5 · Test",
    title: "5.4 Next Steps",
    frage: "Was tun wir nächste Woche?",
    arbeit:
      "Nächste Schritte vorschlagen (Timer 5 Min.), Decider verteilt Aufgaben + Zeitpläne. Spalten: Nächster Schritt/Aufgabe / Wer? / Wann?",
    nutztDatenAus: ["5.3"],
    variant: "table",
  },
];

export const STEP_KEYS = SPRINT_STEPS.map((s) => s.key);

export function getStepDef(key: string): SprintStepDef | undefined {
  return SPRINT_STEPS.find((s) => s.key === key);
}

export function getNextStepKey(key: string): string | null {
  const i = STEP_KEYS.indexOf(key);
  if (i < 0 || i === STEP_KEYS.length - 1) return null;
  return STEP_KEYS[i + 1];
}

export function getPrevStepKey(key: string): string | null {
  const i = STEP_KEYS.indexOf(key);
  if (i <= 0) return null;
  return STEP_KEYS[i - 1];
}

export const DAYS: Array<{ day: SprintDay; label: string }> = [
  { day: 1, label: "Tag 1 · Map" },
  { day: 2, label: "Tag 2 · Sketch" },
  { day: 3, label: "Tag 3 · Decide" },
  { day: 4, label: "Tag 4 · Prototype" },
  { day: 5, label: "Tag 5 · Test" },
];
