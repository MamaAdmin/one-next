import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STEP_META: Record<string, { title: string; task: string }> = {
  "1": { title: "Kick-off & Zielbild", task: "Schlage Punkte zu zwei Kategorien vor: Kontext (Ausgangslage, Situation, warum das Thema jetzt aufkommt) und NichtZiel (typische Abgrenzungen – was NICHT Sprint-Ziel sein sollte). Gib GENAU 3 Punkte je Kategorie (insgesamt 6 Items). Prefixe JEDES Item mit einem der Tags: '[Kontext]', '[NichtZiel]'." },
  "2": { title: "Gegenwart, Vergangenheit & Zukunft", task: "Schlage Punkte zu allen sechs Kategorien vor: Gegenwart (warum jetzt / aktuelle Dringlichkeit), Vergangenheit (was wurde früher versucht / Erfahrungen), Zukunft (Standard-Zukunft – was passiert ohne Handeln), Wettbewerb (was machen Vergleichbare), Trends (für/gegen die Idee) und Chancen (Opportunities). Gib GENAU 3 Punkte je Kategorie (insgesamt 18 Items). Prefixe JEDES Item mit einem der Tags: '[Gegenwart]', '[Vergangenheit]', '[Zukunft]', '[Wettbewerb]', '[Trends]', '[Chancen]'." },
  "3": { title: "Stakeholder & Zielgruppe", task: "Schlage Punkte zu vier Kategorien vor: Stakeholder/Zielgruppen (potenzielle primäre/sekundäre Gruppen), Geparkt (Gruppen, die bewusst NICHT im Sprint-Fokus sind), Heute (wie die Zielgruppe das Problem heute löst / aktuelle Workarounds/Tools), PainGain (welchen Pain lindern wir – welchen Gain schaffen wir aus Sicht der Zielgruppe). Gib GENAU 3 Punkte je Kategorie (insgesamt 12 Items). Prefixe JEDES Item mit einem der Tags: '[Stakeholder]', '[Geparkt]', '[Heute]', '[PainGain]'." },
  "4": { title: "Smart Sailboat", task: "Schlage Einträge für Wind (Treiber), Anker (Hindernisse), Hafen (Ziel), Eisberg (Risiken) vor. Gib eine gemischte Liste, jeweils prefixed mit '[Wind]', '[Anker]', '[Hafen]', '[Eisberg]'." },
  "5": { title: "Root Cause (5 Whys)", task: "Schlage tiefere 'Warum?'-Ebenen und adressierbare Ursachen vor (nur Text, keine Cynefin-Einordnung – die passiert im nächsten Schritt automatisch)." },
  "5b": { title: "Cynefin-Einordnung", task: "Schlage für die Ursachen aus Schritt 5 plausible Cynefin-Kategorien (einfach/kompliziert/komplex/chaotisch) inkl. kurzer Begründung vor. Format je Item: 'Ursache — [Kategorie]: Begründung'." },
  "6": { title: "Annahmen & Risiken", task: "Schlage kritische Annahmen zum Framing vor, verteilt auf 4 Quadranten der 2×2-Matrix (Unsicherheit × Einfluss): Kritisch (hoch/hoch), Einflussreich (niedrige Unsicherheit / hoher Einfluss), Unsicher (hohe Unsicherheit / niedriger Einfluss), Gering (niedrig/niedrig). Gib GENAU 3 Punkte je Quadrant (insgesamt 12 Items). Prefixe JEDES Item mit '[Kritisch]', '[Einflussreich]', '[Unsicher]' oder '[Gering]'." },
  "7": { title: "Erfolg & Constraints", task: "Schlage messbare Erfolgskriterien (5 Tage) und typische Constraints vor." },
  "8": { title: "Scope-Cut & Sprint-Fragen", task: "Schlage In-/Out-of-Scope-Punkte und Decision Questions ('Können wir …?') vor." },
  "9": { title: "Priorisierung (NUF)", task: "Schlage je Sprint-Frage eine erste NUF-Einschätzung vor (Neuheit/Nutzen/Machbarkeit)." },
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
      kontext: "Kontext (Ausgangslage, aktuelle Situation, warum das Thema jetzt aufkommt)",
      nichtziel: "NichtZiel (typische Abgrenzungen – was NICHT Sprint-Ziel sein sollte)",
    };
    const kickoffTag: Record<string, string> = {
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
      why: "Why (tiefere 'Warum?'-Ebenen – jeweils als vollständige 'Warum …? Weil …'-Zeile)",
      ursache: "Ursache (adressierbare Grundursachen – kurze Nominalphrasen)",
    };
    const fiveWhysTag: Record<string, string> = { why: "[Why]", ursache: "[Ursache]" };
    if (step_key === "5" && field && FIVE_WHYS_BUCKETS[field]) {
      meta = {
        title: meta.title,
        task: `Schlage GENAU 3 Punkte NUR für die Kategorie ${FIVE_WHYS_BUCKETS[field]} vor. Keine anderen Kategorien. Prefixe JEDES Item mit '${fiveWhysTag[field]}'.`,
      };
    }

    const CYNEFIN_BUCKETS: Record<string, string> = {
      komplex: "Komplex (Ursache/Wirkung erst rückblickend erkennbar – emergente Praktiken)",
      kompliziert: "Kompliziert (analytisch lösbar mit Fachwissen – gute Praktiken)",
      chaotisch: "Chaotisch (keine erkennbare Kausalität – schnell handeln)",
      einfach: "Einfach/Klar (offensichtliche Ursache/Wirkung – bewährte Praktiken)",
    };
    const cynefinTag: Record<string, string> = {
      komplex: "[Komplex]", kompliziert: "[Kompliziert]", chaotisch: "[Chaotisch]", einfach: "[Einfach]",
    };
    if (step_key === "5b" && field && CYNEFIN_BUCKETS[field]) {
      meta = {
        title: meta.title,
        task: `Schlage GENAU 3 adressierbare Ursachen vor, die in die Cynefin-Domäne ${CYNEFIN_BUCKETS[field]} passen. Keine anderen Domänen. Prefixe JEDES Item mit '${cynefinTag[field]}'.`,
      };
    }
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        response_format: { type: "json_object" },
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
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      const status = resp.status === 429 || resp.status === 402 ? resp.status : 500;
      return json({ error: `AI error: ${errText}` }, status);
    }

    const j = await resp.json();
    const content = j?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { vorschlaege?: unknown } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }
    const vorschlaege = Array.isArray(parsed.vorschlaege)
      ? parsed.vorschlaege.filter((x): x is string => typeof x === "string").slice(0, 24)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildContext(session: any, steps: any[], currentKey: string): string {
  const lines: string[] = [];
  lines.push(`Arbeitstitel: ${session.titel_arbeitstitel || "—"}`);
  if (session.kontext) lines.push(`Kontext: ${session.kontext}`);
  const sorted = [...steps].sort((a, b) => a.step_key.localeCompare(b.step_key));
  for (const s of sorted) {
    if (s.step_key === currentKey) continue;
    lines.push(`\n--- Schritt ${s.step_key} ---\n${JSON.stringify(s.data)}`);
  }
  return lines.join("\n");
}
