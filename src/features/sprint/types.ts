// Shared types for sprint persistence and step payloads.

export interface SprintRow {
  id: string;
  owner_id: string;
  titel: string;
  problemstellung: string;
  modus: "solo" | "team";
  decider: string;
  sprint_leader: string;
  current_step: string;
  status: "active" | "done" | "archived";
  created_at: string;
  updated_at: string;
}

export interface SprintStepRow {
  id: string;
  sprint_id: string;
  step_key: string;
  data: SprintStepData;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Generic shape used by the default checkbox-list renderer.
 * Specialized variants (map, scorecard, etc.) layer additional keys on top.
 */
export interface SprintStepData {
  /** Direkte Antwort des Users auf die Frage des Schritts. */
  antwort?: string;
  vorschlaege?: string[];
  eigene?: string[];
  auswahl?: string[];
  notes?: string;
  // free-form for variant-specific payloads in later etappen
  [k: string]: unknown;
}

