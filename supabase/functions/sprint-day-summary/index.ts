import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { callGemini, geminiErrorStatus } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DAY_LAST_STEP: Record<number, string> = {
  1: "1.11",
  2: "2.5",
  3: "3.6",
  4: "4.1",
  5: "5.4",
};

function stepsForDay(day: number): string[] {
  // we don't know defs server-side, just filter by leading "<day>."
  return []; // placeholder, actual filtering done via DB rows by prefix
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sprintId, day } = await req.json();
    if (!sprintId || !day || !DAY_LAST_STEP[day as number]) {
      return new Response(JSON.stringify({ error: "Bad request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: sprint, error: sErr } = await supabase
      .from("sprints")
      .select("*")
      .eq("id", sprintId)
      .maybeSingle();
    if (sErr || !sprint) throw new Error(sErr?.message ?? "Sprint not found");

    const { data: steps, error: stErr } = await supabase
      .from("sprint_steps")
      .select("*")
      .eq("sprint_id", sprintId);
    if (stErr) throw stErr;

    const prefix = `${day}.`;
    const dayRows = (steps ?? []).filter(
      (r: any) =>
        typeof r.step_key === "string" && r.step_key.startsWith(prefix),
    );

    // Compose context for the model
    const ctx = dayRows
      .map((r: any) => {
        const d = r.data ?? {};
        const lines: string[] = [`### Schritt ${r.step_key}`];
        if (Array.isArray(d.antworten) && d.antworten.length)
          lines.push(`Antworten: ${d.antworten.filter(Boolean).join(" | ")}`);
        if (Array.isArray(d.auswahl) && d.auswahl.length)
          lines.push(`Auswahl: ${d.auswahl.join(" | ")}`);
        if (Array.isArray(d.eigene) && d.eigene.length)
          lines.push(`Eigene: ${d.eigene.join(" | ")}`);
        if (d.notes) lines.push(`Notizen: ${d.notes}`);
        if (d.mapZuordnung && typeof d.mapZuordnung === "object") {
          const z = Object.entries(d.mapZuordnung as Record<string, string>)
            .map(([item, lane]) => `${lane}: ${item}`)
            .join(" | ");
          if (z) lines.push(`Map-Zuordnung: ${z}`);
        }
        return lines.join("\n");
      })
      .join("\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt =
      "Du bist Sprint-Coach in einem Design Sprint. Erstelle eine prägnante, fundierte Tageszusammenfassung auf Deutsch. Antworte AUSSCHLIESSLICH als JSON-Objekt mit den Feldern \"summary\" (string, 3–5 Sätze) und \"keyDecisions\" (Array aus 3–6 prägnanten Bulletpoints als Strings). Keine Markdown-Codefences.";

    const userPrompt = `Sprint: "${sprint.titel}"
Problemstellung: ${sprint.problemstellung}
Tag: ${day}

Ergebnisse der Schritte:

${ctx || "(keine Daten)"}`;

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!aiResp.ok) {
      const text = await aiResp.text();
      return new Response(
        JSON.stringify({ error: `AI gateway ${aiResp.status}: ${text}` }),
        {
          status: aiResp.status === 429 || aiResp.status === 402 ? aiResp.status : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const aiJson = await aiResp.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { summary?: string; keyDecisions?: string[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: String(content), keyDecisions: [] };
    }

    const result = {
      summary: parsed.summary ?? "",
      keyDecisions: Array.isArray(parsed.keyDecisions) ? parsed.keyDecisions : [],
      generatedAt: new Date().toISOString(),
    };

    // Persist into sprint_steps as step_key = "summary.<day>"
    const stepKey = `summary.${day}`;
    await supabase.from("sprint_steps").upsert(
      [
        {
          sprint_id: sprintId,
          step_key: stepKey,
          data: result,
        },
      ],
      { onConflict: "sprint_id,step_key" },
    );

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
