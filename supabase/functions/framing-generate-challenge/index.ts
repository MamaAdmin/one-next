import { createClient } from "npm:@supabase/supabase-js@2";
import { callGemini, geminiErrorStatus } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

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
    if (!session_id) return json({ error: "Bad request" }, 400);

    const { data: session, error: sErr } = await supabase
      .from("framing_sessions")
      .select("*")
      .eq("id", session_id)
      .maybeSingle();
    if (sErr || !session) return json({ error: "Session not found" }, 404);

    const { data: steps } = await supabase
      .from("framing_steps")
      .select("*")
      .eq("session_id", session_id);

    const context = buildContext(session, steps ?? []);

    let aiContent = "{}";
    try {
      const result = await callGemini({
        model: "gemini-2.5-flash",
        json: true,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "Du bist Design-Sprint-Coach und formulierst aus einem abgeschlossenen Problem-Framing-Workshop ein Challenge Statement.\n\nRegeln:\n1. Verwende ausschliesslich Inhalte aus dem gelieferten Kontext. Erfinde nichts – keine Zahlen, keine Zielgruppen, keine Ursachen, die dort nicht stehen. Fehlt eine Angabe, gib für das betreffende JSON-Feld einen leeren String oder ein leeres Array zurück.\n2. Das Challenge Statement enthält keine Lösung, kein Produkt, kein Tool, keine Technologie und keinen Umsetzungsvorschlag. Es beschreibt Problem und Ziel, nicht den Weg.\n3. Die unter GESETZTE ENTSCHEIDUNGEN genannte Sprint-Frage übernimmst du wörtlich. Formuliere sie nicht um und ersetze sie nicht durch eine eigene.\n4. Struktur des Feldes challenge_statement: genau vier Sätze, Fliesstext, keine Überschriften, keine Aufzählung.\n   Satz 1: Für [primäre Zielgruppe], die [Ursache aus den 5 Whys], ist [Symptom] das Problem.\n   Satz 2: Wenn wir nichts ändern, [Standard-Zukunft aus Schritt 2].\n   Satz 3: Bis [Zeithorizont] wollen wir [Langfristziel].\n   Satz 4: Offene Kernfrage: [gewählte Sprint-Frage wörtlich]\n5. erfolgsmessung: ein Satz mit einer in fünf Tagen prüfbaren Grösse aus dem Kontext. Keine erfundenen Zahlen.\n6. sprintFragen: die übrigen Sprint-Fragen aus den Schritten 8 und 9, unverändert übernommen, ohne die bereits gewählte Top-1-Frage.\n7. risiken: ausschliesslich aus den Eisberg-Einträgen (Schritt 4) und den Annahmen mit hoher Unsicherheit und hohem Einfluss (Schritt 6). Keine neuen Risiken.\n8. Deutsch, sachlich, keine Werbesprache, keine Adjektivketten, keine Gedankenstrich-Häufung.\n\nAntworte ausschliesslich als JSON:\n{\"titel\": string, \"challenge_statement\": string, \"zielgruppe\": string, \"erfolgsmessung\": string, \"sprintFragen\": string[], \"risiken\": string[]}",
          },
          {
            role: "user",
            content: `Workshop-Kontext:\n${context}\n\nGib jetzt das strukturierte JSON zurück.`,
          },
        ],
      });
      aiContent = result.content || "{}";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI error";
      return json({ error: msg }, geminiErrorStatus(e));
    }

    let parsed: Record<string, unknown> = {};
    try {
      const cleaned = aiContent.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {};
    }

    const result = {
      titel: strOr(parsed.titel, session.titel_arbeitstitel || "Sprint"),
      challenge_statement: strOr(parsed.challenge_statement, ""),
      zielgruppe: strOr(parsed.zielgruppe, ""),
      erfolgsmessung: strOr(parsed.erfolgsmessung, ""),
      sprintFragen: Array.isArray(parsed.sprintFragen)
        ? (parsed.sprintFragen as unknown[]).filter((x): x is string => typeof x === "string")
        : [],
      risiken: Array.isArray(parsed.risiken)
        ? (parsed.risiken as unknown[]).filter((x): x is string => typeof x === "string")
        : [],
    };

    return json(result);
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

function strOr(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}

const OMIT = new Set(["vorschlaege", "stakeholderPositions", "notes"]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stepData(steps: any[], key: string): Record<string, unknown> {
  const s = steps.find((x) => x.step_key === key);
  return (s?.data ?? {}) as Record<string, unknown>;
}

function clean(d: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d)) {
    if (OMIT.has(k) || v === null || v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === "string" && !v.trim()) continue;
    out[k] = v;
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildContext(session: any, steps: any[]): string {
  const s1 = stepData(steps, "1");
  const s3 = stepData(steps, "3");
  const s5 = stepData(steps, "5");
  const s7 = stepData(steps, "7");
  const s9 = stepData(steps, "9");

  const ursachen = Array.isArray(s5.ursachen)
    ? (s5.ursachen as Array<{ text: string; adressierbar: boolean }>)
        .filter((u) => u.adressierbar)
        .map((u) => u.text)
    : [];

  const out: string[] = [];
  out.push("=== GESETZTE ENTSCHEIDUNGEN (nicht umformulieren, nicht ersetzen) ===");
  out.push(`Arbeitstitel: ${session.titel_arbeitstitel || "—"}`);
  if (session.kontext) out.push(`Kontext: ${session.kontext}`);
  out.push(`Langfristziel: ${s1.langfristziel ?? "—"}`);
  out.push(`Zeithorizont: ${s1.langfristzielHorizont ?? "—"}`);
  out.push(`Primäre Zielgruppe: ${s3.primaereZielgruppe ?? "—"}`);
  out.push(`Beobachtetes Symptom: ${s5.symptom ?? "—"}`);
  out.push(`Adressierbare Ursachen: ${ursachen.length ? ursachen.join(" | ") : "—"}`);
  out.push(`GEWÄHLTE SPRINT-FRAGE (Top 1): ${s9.top1Challenge ?? "—"}`);
  out.push(`Erfolgsmessung: ${s9.erfolgsmessung ?? s7.erfolgsmessung ?? "—"}`);
  out.push(`Constraints: ${JSON.stringify(s7.constraints ?? [])}`);

  out.push("\n=== MATERIAL AUS DEN SCHRITTEN ===");
  const ORDER = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  for (const key of ORDER) {
    const d = clean(stepData(steps, key));
    if (!Object.keys(d).length) continue;
    out.push(`\n--- Schritt ${key} ---\n${JSON.stringify(d)}`);
  }
  return out.join("\n");
}
