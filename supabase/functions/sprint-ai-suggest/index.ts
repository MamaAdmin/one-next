// Edge Function: sprint-ai-suggest
// Returns AI-generated suggestions for a sprint step as strict JSON.
// Auth: validates JWT in code (verify_jwt is project-wide false on this stack).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  sprint_id: z.string().uuid(),
  step_key: z.string().min(1).max(10),
  context: z.record(z.unknown()).default({}),
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth: ensure caller is signed in
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Missing bearer token" }, 401);
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Input
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const { sprint_id, step_key, context } = parsed.data;

    // RLS check by reading the sprint as the user; if user can't read it, 403
    const { data: sprint, error: sprintErr } = await supabase
      .from("sprints")
      .select("id, titel, problemstellung, modus")
      .eq("id", sprint_id)
      .maybeSingle();
    if (sprintErr) return json({ error: sprintErr.message }, 500);
    if (!sprint) return json({ error: "Sprint not accessible" }, 403);

    // Compose the prompt
    const systemPrompt = [
      "Du bist Co-Moderator eines KI-gestützten Design Sprints (Methode nach Jake Knapp).",
      "Liefere kurze, pragmatische, voneinander unterscheidbare Vorschläge in deutscher Sprache.",
      "Antworte AUSSCHLIESSLICH als gültiges JSON, exakt im Format: {\"vorschlaege\": [\"...\", \"...\"]}.",
      "Keine Erklärtexte, keine Markdown-Codefences, keine zusätzlichen Felder.",
      "Erzeuge 5 bis 8 Vorschläge, je 1 Satz, prägnant.",
    ].join(" ");

    const userPrompt = [
      `Sprint-Titel: ${sprint.titel}`,
      `Problemstellung: ${sprint.problemstellung || "(keine angegeben)"}`,
      `Modus: ${sprint.modus}`,
      `Aktueller Schritt: ${step_key}`,
      "",
      "Bisherige Antworten aus früheren Schritten (relevanter Kontext):",
      JSON.stringify(context, null, 2),
      "",
      `Bitte liefere passende Vorschläge für Schritt ${step_key}.`,
    ].join("\n");

    // Call Lovable AI Gateway
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      return json({ error: `AI gateway: ${aiResp.status} ${t}` }, 502);
    }

    const aiJson = await aiResp.json();
    const raw: string = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let vorschlaege: string[] = [];
    try {
      const parsedOut = JSON.parse(raw);
      if (Array.isArray(parsedOut?.vorschlaege)) {
        vorschlaege = parsedOut.vorschlaege
          .filter((v: unknown) => typeof v === "string")
          .map((v: string) => v.trim())
          .filter(Boolean)
          .slice(0, 10);
      }
    } catch {
      // ignore — fall through to empty
    }

    return json({ vorschlaege }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
