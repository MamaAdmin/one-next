// Shared types for sprint persistence and step payloads.

export interface SprintRow {
  id: string;
  owner_id: string;
  titel: string;
  problemstellung: string;
  modus: "team" | "solo";
  decider: string;
  sprint_leader: string;
  current_step: string;
  status: "active" | "done" | "archived";
  challenge_statement: string;
  zielgruppe: string;
  erfolgsmessung: string;
  sprint_fragen: string[];
  risiken?: string[];
  kickoff_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const SPRINT_TEAM_ROLES = [
  "decider",
  "sprint_leader",
  "finance",
  "marketing",
  "customer",
  "tech",
  "design",
  "wildcard",
  "viewer",
] as const;
export type SprintTeamRole = (typeof SPRINT_TEAM_ROLES)[number];

export interface SprintMemberRow {
  id: string;
  sprint_id: string;
  user_id: string | null;
  email: string | null;
  rolle: SprintTeamRole | string;
  created_at: string;
}

export interface SprintInvitationRow {
  id: string;
  sprint_id: string;
  email: string;
  full_name: string;
  role_type: SprintTeamRole;
  token: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  invited_by: string;
  created_at: string;
  accepted_at: string | null;
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
  /** Direkte Antworten des Users auf die Frage des Schritts (Sticky-Notes). */
  antworten?: string[];
  /** @deprecated alte Single-Antwort, wird beim Laden in `antworten` migriert. */
  antwort?: string;
  vorschlaege?: string[];
  eigene?: string[];
  auswahl?: string[];
  notes?: string;
  /** Map-Variante (1.8): Zuordnung Item-Text → Lane-ID. */
  mapZuordnung?: Record<string, string>;
  /** KI-Ranking + Marktrecherche (Solo-Modus). */
  aiRank?: {
    marktrecherche: string;
    quellen: { title: string; uri: string }[];
    ranking: { option: string; rang: number; begruendung: string }[];
  };
  // free-form for variant-specific payloads in later etappen
  [k: string]: unknown;
}

/** Lanes für die Map-Variante (Schritt 1.8). */
export const MAP_LANES: Array<{ id: string; label: string; hint?: string }> = [
  { id: "customers", label: "Kunden", hint: "Wichtigste Kundentypen" },
  { id: "other_actors", label: "Weitere Akteure", hint: "Weitere beteiligte Personen/Rollen" },
  { id: "discovery", label: "Entdeckung", hint: "Wie Kunden uns finden" },
  { id: "core", label: "Kern", hint: "Kernerfahrung mit dem Produkt" },
  { id: "outcome", label: "Ergebnis", hint: "Ereignis, das zeigt: wir sind auf Kurs" },
  { id: "target_risk", label: "Zielrisiko", hint: "Das kritische Risiko auf der Karte" },
];

