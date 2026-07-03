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
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content:
              "Du bist Design-Sprint-Coach. Erzeuge aus dem Framing-Workshop ein prägnantes Challenge Statement. Antworte AUSSCHLIESSLICH als JSON: {\"titel\": string, \"challenge_statement\": string, \"zielgruppe\": string, \"erfolgsmessung\": string, \"sprintFragen\": string[], \"risiken\": string[]}. Deutsch, konkret, sprintreif.",
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildContext(session: any, steps: any[]): string {
  const lines: string[] = [];
  lines.push(`Arbeitstitel: ${session.titel_arbeitstitel || "—"}`);
  if (session.kontext) lines.push(`Kontext: ${session.kontext}`);
  const sorted = [...steps].sort((a, b) => a.step_key.localeCompare(b.step_key));
  for (const s of sorted) {
    lines.push(`\n--- Schritt ${s.step_key} ---\n${JSON.stringify(s.data)}`);
  }
  return lines.join("\n");
}
