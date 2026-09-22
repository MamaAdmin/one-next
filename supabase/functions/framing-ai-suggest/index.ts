import { createClient } from "npm:@supabase/supabase-js@2";
import { callGemini, geminiErrorStatus } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STEP_DEPS: Record<string, string[]> = {
  "1": [],
  "2": ["1"],
  "3": ["1", "2"],
  "4": ["1", "2", "3"],
  "5": ["1", "3", "4"],
  "6": ["1", "2", "3", "4", "5"],
  "7": ["1", "3", "4"],
  "8": ["1", "4", "5", "6", "7"],
  "9": ["1", "6", "8"],
  "10": ["1", "3", "4", "5", "6", "7", "8", "9"],
};

const OMIT_KEYS = new Set(["vorschlaege", "stakeholderPositions", "notes"]);

const STEP_META: Record<string, { title: string; task: string }> = {
  "1": { title: "Kick-off, Langfristziel & Abgrenzung", task: "Schlage Punkte zu drei Kategorien vor: Ziel (Langfristziel – ein Satz im Format 'In zwei Jahren wird …', kein Lösungsvorschlag, keine Technologie), Kontext (Ausgangslage, Situation, warum das Thema jetzt aufkommt) und NichtZiel (typische Abgrenzungen – was NICHT Sprint-Ziel sein sollte). Gib GENAU 3 Punkte je Kategorie (insgesamt 9 Items). Prefixe JEDES Item mit einem der Tags: '[Ziel]', '[Kontext]', '[NichtZiel]'." },
  "2": { title: "Gegenwart, Vergangenheit & Zukunft", task: "Schlage Punkte zu allen sechs Kategorien vor: Gegenwart (warum jetzt / aktuelle Dringlichkeit), Vergangenheit (was wurde früher versucht / Erfahrungen), Zukunft (Standard-Zukunft – was passiert ohne Handeln), Wettbewerb (was machen Vergleichbare), Trends (für/gegen die Idee) und Chancen (Opportunities). Gib GENAU 3 Punkte je Kategorie (insgesamt 18 Items). Prefixe JEDES Item mit einem der Tags: '[Gegenwart]', '[Vergangenheit]', '[Zukunft]', '[Wettbewerb]', '[Trends]', '[Chancen]'." },
  "3": { title: "Stakeholder & Zielgruppe", task: "Schlage Punkte zu vier Kategorien vor: Stakeholder/Zielgruppen (potenzielle primäre/sekundäre Gruppen), Geparkt (Gruppen, die bewusst NICHT im Sprint-Fokus sind), Heute (wie die Zielgruppe das Problem heute löst / aktuelle Workarounds/Tools), PainGain (welchen Pain lindern wir – welchen Gain schaffen wir aus Sicht der Zielgruppe). Gib GENAU 3 Punkte je Kategorie (insgesamt 12 Items). Prefixe JEDES Item mit einem der Tags: '[Stakeholder]', '[Geparkt]', '[Heute]', '[PainGain]'." },
  "4": { title: "Smart Sailboat (Verdichtung)", task: "Die Felder sind bereits aus den Schritten 1 bis 3 vorbefüllt. Schlage höchstens 2 Ergänzungen je Kategorie vor, die dort noch nicht stehen. Keine Wiederholungen. Kategorien: Wind (Treiber), Anker (Hindernisse), Hafen (Ziel), Eisberg (Risiken). Prefixe JEDES Item mit '[Wind]', '[Anker]', '[Hafen]' oder '[Eisberg]'." },
  "5": { title: "Root Cause (5 Whys)", task: "Schlage ein beobachtbares Symptom, tiefere 'Warum?'-Ebenen und adressierbare Ursachen vor. Prefixe JEDES Item mit '[Symptom]', '[Why]' oder '[Ursache]'." },

  "6": { title: "Annahmen & Risiken", task: "Schlage kritische Annahmen zum Framing vor, verteilt auf 4 Quadranten der 2×2-Matrix (Unsicherheit × Einfluss): Kritisch (hoch/hoch), Einflussreich (niedrige Unsicherheit / hoher Einfluss), Unsicher (hohe Unsicherheit / niedriger Einfluss), Gering (niedrig/niedrig). Gib GENAU 3 Punkte je Quadrant (insgesamt 12 Items). Prefixe JEDES Item mit '[Kritisch]', '[Einflussreich]', '[Unsicher]' oder '[Gering]'." },
  "7": { title: "Constraints & Rahmenbedingungen", task: "Schlage harte Randbedingungen vor, die gesetzt sind – z. B. Budget, Technik, Zeit, Recht/Compliance, Team. Gib GENAU 5 Punkte auf Deutsch. Prefixe JEDES Item mit '[Constraint]'." },
  "8": { title: "Scope-Cut & Sprint-Fragen", task: "Schlage Punkte zu drei Kategorien vor: InScope (was gehört klar in den Sprint-Fokus – konkrete Themen, Deliverables, Aktivitäten), OutScope (was wird bewusst ausgeklammert – typische Abgrenzungen, Nice-to-haves, Folgeprojekte) und Sprintfrage (Decision Questions als 'Können wir …?'-Fragen, in 5 Tagen entscheidbar). Gib GENAU 3 Punkte je Kategorie (insgesamt 9 Items) auf Deutsch. Prefixe JEDES Item mit '[InScope]', '[OutScope]' oder '[Sprintfrage]'." },
  "9": { title: "Priorisierung (NUF) & Erfolgsmessung", task: "Schlage messbare Erfolgskriterien für die gewählte Sprint-Frage vor, in fünf Tagen mit Prototyp und fünf Testpersonen prüfbar. Prefixe JEDES Item mit '[Erfolg]'. Ergänze danach prägnante Sprint-Fragen für die NUF-Priorisierung. WICHTIG: Gib ausschliesslich den reinen Fragetext aus – KEINE NUF-Einschätzungen, KEINE Klammer-Zusätze wie '(N: Hoch, U: Hoch, F: Hoch)', keine Bewertungen, keine Tags." },
  "10": { title: "Entscheidung & Next Steps", task: "Schlage Standard-Pre-Sprint-To-dos vor (Decider, ≥5 Testnutzer:innen, Datenzugang, Constraints)." },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const session_id = String(body?.session_id ?? "");
    const step_key = String(body?.step_key ?? "");
    const field = typeof body?.field === "string" ? body.field.trim().toLowerCase() : "";
    if (!session_id || !STEP_META[step_key]) {
      return json({ error: "Bad request" }, 400);
    }

    const TWO_FIELDS_BUCKETS: Record<string, string> = {
      gegenwart: "Gegenwart (warum jetzt / aktuelle Dringlichkeit)",
      vergangenheit: "Vergangenheit (was wurde früher versucht / Erfahrungen)",
      zukunft: "Zukunft (Standard-Zukunft – was passiert ohne Handeln)",
      wettbewerb: "Wettbewerb (was machen Vergleichbare)",
      trends: "Trends (für/gegen die Idee)",
      chancen: "Chancen (Opportunities)",
    };
    const bucketTag: Record<string, string> = {
      gegenwart: "[Gegenwart]",
      vergangenheit: "[Vergangenheit]",
      zukunft: "[Zukunft]",
      wettbewerb: "[Wettbewerb]",
      trends: "[Trends]",
      chancen: "[Chancen]",
    };

    const STAKEHOLDER_BUCKETS: Record<string, string> = {
      stakeholder: "Stakeholder/Zielgruppen (potenzielle primäre/sekundäre Gruppen)",
      geparkt: "Geparkt (Gruppen, die bewusst NICHT im Sprint-Fokus sind)",
      heute: "Heute (wie die Zielgruppe das Problem heute löst / Workarounds/Tools)",
      paingain: "PainGain (welchen Pain lindern wir – welchen Gain schaffen wir)",
    };
    const stakeholderTag: Record<string, string> = {
      stakeholder: "[Stakeholder]",
      geparkt: "[Geparkt]",
      heute: "[Heute]",
      paingain: "[PainGain]",
    };

    const KICKOFF_BUCKETS: Record<string, string> = {
      ziel: "Ziel (Langfristziel – ein Satz im Format 'In zwei Jahren wird …', kein Lösungsvorschlag, keine Technologie)",
      kontext: "Kontext (Ausgangslage, aktuelle Situation, warum das Thema jetzt aufkommt)",
      nichtziel: "NichtZiel (typische Abgrenzungen – was NICHT Sprint-Ziel sein sollte)",
    };
    const kickoffTag: Record<string, string> = {
      ziel: "[Ziel]",
      kontext: "[Kontext]",
      nichtziel: "[NichtZiel]",
    };

    // Read session + prior steps (RLS scoped to owner)
    const { data: session, error: sErr } = await supabase
      .from("framing_sessions")
      .select("*")
      .eq("id", session_id)
      .maybeSingle();
    if (sErr || !session) return json({ error: "Session not found" }, 404);

    const { data: allSteps } = await supabase
      .from("framing_steps")
      .select("*")
      .eq("session_id", session_id);

    const context = buildContext(session, allSteps ?? [], step_key);

    let meta = STEP_META[step_key];
    if (step_key === "2" && field && TWO_FIELDS_BUCKETS[field]) {
      meta = {
        title: meta.title,
        task: `Schlage GENAU 3 Punkte NUR für die Kategorie ${TWO_FIELDS_BUCKETS[field]} vor. Keine anderen Kategorien. Prefixe JEDES Item mit '${bucketTag[field]}'.`,
      };
    }
    if (step_key === "3" && field && STAKEHOLDER_BUCKETS[field]) {
      meta = {
        title: meta.title,
        task: `Schlage GENAU 3 Punkte NUR für die Kategorie ${STAKEHOLDER_BUCKETS[field]} vor. Keine anderen Kategorien. Prefixe JEDES Item mit '${stakeholderTag[field]}'.`,
      };
    }
    if (step_key === "1" && field && KICKOFF_BUCKETS[field]) {
      meta = {
        title: meta.title,
        task: `Schlage GENAU 3 Punkte NUR für die Kategorie ${KICKOFF_BUCKETS[field]} vor. Keine anderen Kategorien. Prefixe JEDES Item mit '${kickoffTag[field]}'.`,
      };
    }

    const SAILBOAT_BUCKETS: Record<string, string> = {
      wind: "Wind (Treiber, die das Team voranbringen)",
      anker: "Anker (Hindernisse, die das Team bremsen)",
      hafen: "Hafen (klares Ziel / gewünschter Zielzustand)",
      eisberg: "Eisberg (verborgene Risiken)",
    };
    const sailboatTag: Record<string, string> = {
      wind: "[Wind]", anker: "[Anker]", hafen: "[Hafen]", eisberg: "[Eisberg]",
    };
    if (step_key === "4" && field && SAILBOAT_BUCKETS[field]) {
      meta = {
        title: meta.title,
        task: `Schlage GENAU 3 Punkte NUR für die Kategorie ${SAILBOAT_BUCKETS[field]} vor. Keine anderen Kategorien. Prefixe JEDES Item mit '${sailboatTag[field]}'.`,
      };
    }

    const FIVE_WHYS_BUCKETS: Record<string, string> = {
      symptom: "Symptom (beobachtbares Symptom in einem Satz, möglichst mit Beobachtung oder Kennzahl, keine Ursache und keine Lösung)",
      why: "Why (tiefere 'Warum?'-Ebenen – jeweils als vollständige 'Warum …? Weil …'-Zeile)",
      ursache: "Ursache (adressierbare Grundursachen – kurze Nominalphrasen)",
    };
    const fiveWhysTag: Record<string, string> = { symptom: "[Symptom]", why: "[Why]", ursache: "[Ursache]" };
    if (step_key === "5" && field && FIVE_WHYS_BUCKETS[field]) {
      meta = {
        title: meta.title,
        task: `Schlage GENAU 3 Punkte NUR für die Kategorie ${FIVE_WHYS_BUCKETS[field]} vor. Keine anderen Kategorien. Prefixe JEDES Item mit '${fiveWhysTag[field]}'.`,
      };
    }

    const ASSUMPTION_BUCKETS: Record<string, string> = {
      kritisch: "Kritisch (hohe Unsicherheit UND hoher Einfluss – sofort testen)",
      einflussreich: "Einflussreich (niedrige Unsicherheit, hoher Einfluss – belastbare Annahmen mit Hebel)",
      unsicher: "Unsicher (hohe Unsicherheit, niedriger Einfluss – später klären)",
      gering: "Gering (niedrige Unsicherheit UND niedriger Einfluss – ignorierbar)",
    };
    const assumptionTag: Record<string, string> = {
      kritisch: "[Kritisch]", einflussreich: "[Einflussreich]", unsicher: "[Unsicher]", gering: "[Gering]",
    };
    if (step_key === "6" && field && ASSUMPTION_BUCKETS[field]) {
      meta = {
        title: meta.title,
        task: `Schlage GENAU 3 Annahmen NUR für den Quadranten ${ASSUMPTION_BUCKETS[field]} vor. Keine anderen Quadranten. Prefixe JEDES Item mit '${assumptionTag[field]}'.`,
      };
    }
    const SUCCESS_BUCKETS: Record<string, string> = {
      constraint: "Constraint (harte Randbedingungen, die gesetzt sind – z. B. Budget, Technik, Zeit, Recht/Compliance, Team)",
    };
    const successTag: Record<string, string> = { constraint: "[Constraint]" };
    const NUF_BUCKETS: Record<string, string> = {
      erfolg: "Erfolg (messbare Erfolgskriterien für die gewählte Sprint-Frage, in fünf Tagen mit Prototyp und fünf Testpersonen prüfbar)",
    };
    if (step_key === "9" && field && NUF_BUCKETS[field]) {
      meta = {
        title: meta.title,
        task: `Schlage GENAU 3 Punkte NUR für die Kategorie ${NUF_BUCKETS[field]} vor. Keine anderen Kategorien. Antworte auf Deutsch. Prefixe JEDES Item mit '[Erfolg]'.`,
      };
    }
    if (step_key === "7" && field && SUCCESS_BUCKETS[field]) {
      meta = {
        title: meta.title,
        task: `Schlage GENAU 3 Punkte NUR für die Kategorie ${SUCCESS_BUCKETS[field]} vor. Keine anderen Kategorien. Antworte auf Deutsch. Prefixe JEDES Item mit '${successTag[field]}'.`,
      };
    }
    const SCOPE_BUCKETS: Record<string, string> = {
      inscope: "InScope (was gehört klar in den Sprint-Fokus – konkrete Themen, Deliverables, Aktivitäten)",
      outscope: "OutScope (was wird bewusst ausgeklammert – typische Abgrenzungen, Nice-to-haves, Folgeprojekte)",
      sprintfrage: "Sprintfrage (Decision Questions als 'Können wir …?'-Fragen, in 5 Tagen entscheidbar)",
    };
    const scopeTag: Record<string, string> = {
      inscope: "[InScope]", outscope: "[OutScope]", sprintfrage: "[Sprintfrage]",
    };
    if (step_key === "8" && field && SCOPE_BUCKETS[field]) {
      meta = {
        title: meta.title,
        task: `Schlage GENAU 3 Punkte NUR für die Kategorie ${SCOPE_BUCKETS[field]} vor. Keine anderen Kategorien. Antworte auf Deutsch. Prefixe JEDES Item mit '${scopeTag[field]}'.`,
      };
    }
    let aiContent = "{}";
    try {
      const result = await callGemini({
        model: "gemini-2.5-flash",
        json: true,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "Du bist ein erfahrener Problem-Framing-Facilitator (Pre-Sprint-Workshop). Antworte AUSSCHLIESSLICH als JSON im Format {\"vorschlaege\": string[]}. Kurze, konkrete Punkte auf Deutsch. Falls die Aufgabe eine Anzahl je Kategorie vorgibt, halte dich exakt daran; ansonsten 5–8 Punkte. Keine Erklärungen außerhalb des JSON.",
          },
          {
            role: "user",
            content:
              `Aktueller Schritt: ${meta.title}\nAufgabe: ${meta.task}\n\nBisheriger Workshop-Kontext:\n${context}\n\nGib jetzt die Vorschläge zurück.`,
          },
        ],
      });
      aiContent = result.content || "{}";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI error";
      return json({ error: msg }, geminiErrorStatus(e));
    }

    let parsed: { vorschlaege?: unknown } = {};
    try {
      const cleaned = aiContent.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {};
    }
    const vorschlaege = Array.isArray(parsed.vorschlaege)
      ? parsed.vorschlaege
          .filter((x): x is string => typeof x === "string")
          .map((s) =>
            step_key === "9"
              ? s.replace(/\s*[\(\[][^)\]]*\b[NUF]\s*:[^)\]]*[\)\]]\s*$/i, "").trim()
              : s,
          )
          .slice(0, 24)

      : [];

    return json({ vorschlaege });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanStepData(data: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!data || typeof data !== "object") return out;
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (OMIT_KEYS.has(k) || v === null || v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === "string" && !v.trim()) continue;
    out[k] = v;
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildContext(session: any, steps: any[], currentKey: string): string {
  const lines: string[] = [];
  lines.push(`Arbeitstitel: ${session.titel_arbeitstitel || "—"}`);
  if (session.kontext) lines.push(`Kontext: ${session.kontext}`);
  const deps = STEP_DEPS[currentKey] ?? [];
  for (const key of deps) {
    const row = steps.find((s) => s.step_key === key);
    if (!row) continue;
    const d = cleanStepData(row.data);
    if (!Object.keys(d).length) continue;
    lines.push(`\n--- Schritt ${key} ---\n${JSON.stringify(d)}`);
  }
  return lines.join("\n");
}
