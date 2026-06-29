// Edge Function: sprint-ai-suggest
// Returns AI-generated suggestions for a sprint step as strict JSON.
// Calls Google Gemini API directly — billing runs through the user's Google AI Studio / GCP project.

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
  step_frage: z.string().max(500).optional(),
  step_arbeit: z.string().max(1500).optional(),
});


const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-2.5-flash";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      return json({ error: "GEMINI_API_KEY is not configured" }, 500);
    }

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
    const { sprint_id, step_key, context, step_frage, step_arbeit } = parsed.data;

    // RLS check by reading the sprint as the user; if user can't read it, 403
    const { data: sprint, error: sprintErr } = await supabase
      .from("sprints")
      .select("id, titel, problemstellung, modus")
      .eq("id", sprint_id)
      .maybeSingle();
    if (sprintErr) return json({ error: sprintErr.message }, 500);
    if (!sprint) return json({ error: "Sprint not accessible" }, 403);

    // Compose the prompt
    const isHmw = step_key === "1.4";
    const isRisks = step_key === "1.3";
    const systemPrompt = [
      "Du bist Co-Moderator eines KI-gestützten Design Sprints (Methode nach Jake Knapp).",
      "Liefere kurze, pragmatische, voneinander unterscheidbare Vorschläge in deutscher Sprache.",
      "Antworte AUSSCHLIESSLICH als gültiges JSON, exakt im Format: {\"vorschlaege\": [\"...\", \"...\"]}.",
      "Keine Erklärtexte, keine Markdown-Codefences, keine zusätzlichen Felder.",
      "Erzeuge 5 bis 8 Vorschläge, je 1 Satz, prägnant.",
      "WICHTIG: Beachte exakt die Frage und die Arbeitsanweisung des Schritts. Verwende den Kontext aus früheren Schritten nur als Hintergrund — kopiere keine Antworten aus früheren Schritten.",
      isHmw
        ? "Format-Regel: Jeder Vorschlag MUSS eine HMW-Frage sein, exakt mit 'Wie können wir ' beginnen und mit '?' enden. Keine Aussagen, keine Aufzählungszeichen, kein anderer Satzanfang."
        : "",
      isRisks
        ? "Format-Regel: Jeder Vorschlag MUSS eine pessimistische Ja/Nein-Frage sein, die ein konkretes Risiko fürs Erreichen von Ziel/Metriken beschreibt. Beginne jeden Vorschlag mit 'Können wir ', 'Werden wir ', 'Werden ' oder 'Ist '. Ende mit '?'. Keine positiven Aussagen, keine Erfolgs-Statements, keine Metrik-Wiederholungen."
        : "",
    ].filter(Boolean).join(" ");

    const userPrompt = [
      `Sprint-Titel: ${sprint.titel}`,
      `Problemstellung: ${sprint.problemstellung || "(keine angegeben)"}`,
      `Modus: ${sprint.modus}`,
      `Aktueller Schritt: ${step_key}`,
      step_frage ? `Frage dieses Schritts: ${step_frage}` : "",
      step_arbeit ? `Arbeitsanweisung dieses Schritts: ${step_arbeit}` : "",
      "",
      "Bisherige Antworten aus früheren Schritten (NUR als Kontext, NICHT erneut ausgeben):",
      JSON.stringify(context, null, 2),
      "",
      `Bitte liefere passende Vorschläge für Schritt ${step_key}, exakt zur Frage und Arbeitsanweisung passend.`,
    ].filter(Boolean).join("\n");


    // Call Google Gemini API directly
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const aiResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              vorschlaege: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["vorschlaege"],
          },
          temperature: 0.8,
        },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      if (aiResp.status === 401 || aiResp.status === 403) {
        return json({ error: "Gemini API key invalid or lacks permissions" }, 502);
      }
      if (aiResp.status === 429) {
        return json({ error: "Gemini rate limit exceeded" }, 429);
      }
      return json({ error: `Gemini API: ${aiResp.status} ${t}` }, 502);
    }

    const aiJson = await aiResp.json();
    const raw: string =
      aiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    let vorschlaege: string[] = [];
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsedOut = JSON.parse(cleaned);
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

    if (isHmw) {
      vorschlaege = vorschlaege
        .map((v) => {
          let s = v.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, "").trim();
          s = s.replace(/^["'„"»«]+|["'""»«]+$/g, "").trim();
          if (!/^wie können wir\s/i.test(s)) {
            s = "Wie können wir " + s.charAt(0).toLowerCase() + s.slice(1);
          } else {
            s = "Wie können wir " + s.slice("Wie können wir ".length);
          }
          s = s.replace(/[.!]+$/, "");
          if (!s.endsWith("?")) s += "?";
          return s.trim();
        })
        .filter((s) => s.length >= 18);
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
