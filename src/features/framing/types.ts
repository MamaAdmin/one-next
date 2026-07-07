// Types for the Problem-Framing Workshop (pre-sprint).

export interface FramingSessionRow {
  id: string;
  owner_id: string;
  titel_arbeitstitel: string;
  kontext: string;
  current_step: number;
  status: "active" | "done" | "archived";
  challenge_statement: string | null;
  resulting_sprint_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FramingStepRow {
  id: string;
  session_id: string;
  step_key: string; // "1".."10"
  data: FramingStepData;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}



export interface FramingStepData {
  // Step 1
  kontext?: string;
  nichtZiele?: string[];
  kiNichtZiele?: string[];
  kiKontext?: string[];
  // Step 1 – Canvas: Business-Past
  frueherVersucht?: Array<{ text: string; ergebnis: "worked" | "didnt-work" }>;
  // Step 2
  warumJetzt?: string;
  defaultFuture?: string | string[];
  // Step 2 – Canvas: Business-Future
  wettbewerber?: string[];
  trends?: string[];
  chancen?: string[];
  // Step 2 – Übernommene KI-Vorschläge (getrennt von User-Eingaben)
  kiWarumJetzt?: string[];
  kiDefaultFuture?: string[];
  kiWettbewerber?: string[];
  kiTrends?: string[];
  kiChancen?: string[];
  // Step 3
  stakeholder?: string[];
  primaereZielgruppe?: string;
  sekundaerGeparkt?: string[];
  // Step 3 – Canvas: Customer-Present/Past/Pain
  kundeHeuteLoesung?: string;
  kundeVersuchePast?: Array<{ text: string; ergebnis: "worked" | "didnt-work" }>;
  kundePainGain?: string;
  // Step 3 – Übernommene KI-Vorschläge
  kiStakeholder?: string[];
  kiSekundaerGeparkt?: string[];
  kiKundeHeuteLoesung?: string[];
  kiKundePainGain?: string[];
  // Step 4
  sailboat?: {
    wind: string[];
    anker: string[];
    hafen: string;
    eisberg: string[];
  };
  // Step 4 – Übernommene KI-Vorschläge (getrennt von User-Eingaben)
  kiWind?: string[];
  kiAnker?: string[];
  kiHafen?: string[];
  kiEisberg?: string[];
  // Step 5
  fiveWhys?: string[];
  ursachen?: Array<{ text: string; adressierbar: boolean }>;
  // Step 5 – Übernommene KI-Vorschläge (getrennt von User-Eingaben)
  kiFiveWhys?: string[];
  kiUrsachen?: string[];
  // Step 6
  annahmen?: Array<{ text: string; unsicherheit: number; einfluss: number }>;
  // Step 7
  erfolgsmessung?: string;
  constraints?: string[];
  // Step 7 – Übernommene KI-Vorschläge
  kiErfolgsmessung?: string[];
  kiConstraints?: string[];
  // Step 8
  inScope?: string[];
  outOfScope?: string[];
  sprintFragen?: string[];
  // Step 8 – Übernommene KI-Vorschläge
  kiInScope?: string[];
  kiOutOfScope?: string[];
  kiSprintFragen?: string[];
  // Step 9
  nufBewertungen?: Array<{ text: string; neuheit: number; nutzen: number; machbarkeit: number }>;
  top1Challenge?: string;
  // Step 10
  sprintGo?: boolean;
  preSprintTodos?: Array<{ text: string; wer: string; wann: string }>;
  // Shared
  vorschlaege?: string[];
  notes?: string;
  [k: string]: unknown;
}

export interface ChallengeStatementResult {
  titel: string;
  challenge_statement: string;
  zielgruppe: string;
  erfolgsmessung: string;
  sprintFragen: string[];
  risiken: string[];
}
