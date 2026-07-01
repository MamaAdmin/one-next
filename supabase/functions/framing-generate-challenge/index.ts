import { createClient } from "npm:@supabase/supabase-js@2";

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

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    const context = buildContext(session, steps ?? []);

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
              "Du bist Design-Sprint-Coach. Erzeuge aus dem Framing-Workshop ein prägnantes Challenge Statement. Antworte AUSSCHLIESSLICH als JSON: {\"titel\": string, \"challenge_statement\": string, \"zielgruppe\": string, \"erfolgsmessung\": string, \"sprintFragen\": string[], \"risiken\": string[]}. Deutsch, konkret, sprintreif.",
          },
          {
            role: "user",
            content: `Workshop-Kontext:\n${context}\n\nGib jetzt das strukturierte JSON zurück.`,
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
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(content);
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
