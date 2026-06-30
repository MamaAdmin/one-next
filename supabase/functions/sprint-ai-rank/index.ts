// Edge Function: sprint-ai-rank
// Solo-Modus: Liefert eine kurze Marktrecherche (Google-Search-Grounding)
// und ein Ranking der vorhandenen Optionen via Google Gemini.

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
  step_frage: z.string().max(500).optional(),
  step_arbeit: z.string().max(1500).optional(),
  options: z.array(z.string().min(1).max(500)).min(2).max(40),
  context: z.record(z.unknown()).default({}),
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

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const { sprint_id, step_key, step_frage, step_arbeit, options, context } = parsed.data;

    const { data: sprint, error: sprintErr } = await supabase
      .from("sprints")
      .select("id, titel, problemstellung, modus")
      .eq("id", sprint_id)
      .maybeSingle();
    if (sprintErr) return json({ error: sprintErr.message }, 500);
    if (!sprint) return json({ error: "Sprint not accessible" }, 403);

    const systemPrompt = [
      "Du bist Co-Moderator eines KI-gestützten Design Sprints (nach Jake Knapp).",
      "Aufgabe: Mache eine KURZE Marktrecherche zum Thema des aktuellen Sprint-Schritts (nutze Google-Suche) und ranke anschließend die vom User gelieferten Optionen.",
      "Antworte AUSSCHLIESSLICH als gültiges JSON in EXAKT diesem Format und mit deutscher Sprache:",
      `{"marktrecherche":"2-4 Sätze Fließtext mit aktuellen Markttrends/Erkenntnissen","ranking":[{"option":"<wortwörtlich eine der gelieferten Optionen>","rang":1,"begruendung":"1 Satz, warum dieser Rang"}]}`,
      "Regeln für ranking:",
      "- Verwende JEDE gelieferte Option genau einmal.",
      "- Rang beginnt bei 1 (beste). Keine Duplikate, keine Lücken.",
      "- 'option' MUSS exakt dem gelieferten Text entsprechen (Zeichen für Zeichen).",
      "- Berücksichtige Sprint-Titel, Problemstellung, Frage und Marktrecherche bei der Bewertung.",
      "Keine Erklärtexte außerhalb des JSON, keine Markdown-Codefences.",
    ].join(" ");

    const userPrompt = [
      `Sprint-Titel: ${sprint.titel}`,
      `Problemstellung: ${sprint.problemstellung || "(keine angegeben)"}`,
      `Aktueller Schritt: ${step_key}`,
      step_frage ? `Frage: ${step_frage}` : "",
      step_arbeit ? `Arbeitsanweisung: ${step_arbeit}` : "",
      "",
      "Kontext aus früheren Schritten (nur Hintergrund):",
      JSON.stringify(context, null, 2),
      "",
      "Zu rankende Optionen (wortwörtlich übernehmen):",
      ...options.map((o, i) => `${i + 1}. ${o}`),
      "",
      "Recherchiere kurz die wichtigsten aktuellen Marktinformationen zum Thema und ranke dann alle Optionen.",
    ].filter(Boolean).join("\n");

    // Note: Bei aktiviertem google_search-Tool akzeptiert Gemini KEIN responseSchema/responseMimeType.
    // Wir verlangen JSON ausschließlich per Prompt und parsen den Text robust.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const aiResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.6,
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
    const candidate = aiJson?.candidates?.[0];
    const raw: string =
      candidate?.content?.parts?.map((p: { text?: string }) => p?.text ?? "").join("") ?? "";

    // Quellen aus groundingMetadata extrahieren
    const groundingChunks: Array<{ web?: { uri?: string; title?: string } }> =
      candidate?.groundingMetadata?.groundingChunks ?? [];
    const quellen = groundingChunks
      .map((c) => c?.web)
      .filter((w): w is { uri: string; title?: string } => !!w?.uri)
      .map((w) => ({ uri: w.uri, title: (w.title ?? w.uri).trim() }))
      .slice(0, 8);

    // JSON aus Antwort extrahieren (kann von Codefences umgeben sein)
    let marktrecherche = "";
    let ranking: { option: string; rang: number; begruendung: string }[] = [];
    try {
      const cleaned = raw
        .replace(/^[\s\S]*?(\{)/, "$1")          // alles vor erstem '{' weg
        .replace(/```[\s\S]*$/g, "")             // codefence-Reste am Ende weg
        .replace(/^```(?:json)?\s*/i, "")
        .trim();
      // Versuch: direktes JSON
      const parsedOut = safeParseJsonObject(cleaned);
      if (parsedOut) {
        if (typeof parsedOut.marktrecherche === "string") {
          marktrecherche = parsedOut.marktrecherche.trim();
        }
        if (Array.isArray(parsedOut.ranking)) {
          ranking = parsedOut.ranking
            .filter(
              (r: unknown): r is { option: string; rang: number; begruendung?: string } =>
                !!r && typeof r === "object" &&
                typeof (r as { option?: unknown }).option === "string" &&
                typeof (r as { rang?: unknown }).rang === "number",
            )
            .map((r) => ({
              option: r.option.trim(),
              rang: Math.max(1, Math.floor(r.rang)),
              begruendung: typeof r.begruendung === "string" ? r.begruendung.trim() : "",
            }));
        }
      }
    } catch {
      // ignore — return whatever we have
    }

    // Optionen auf gelieferte zurückmatchen (case-insensitive Fallback)
    const optByLower = new Map(options.map((o) => [o.toLowerCase(), o]));
    ranking = ranking
      .map((r) => {
        const exact = options.includes(r.option) ? r.option : optByLower.get(r.option.toLowerCase());
        return exact ? { ...r, option: exact } : null;
      })
      .filter((r): r is { option: string; rang: number; begruendung: string } => !!r);

    // Fehlende Optionen ans Ende hängen, damit immer alle gerankt sind
    const seen = new Set(ranking.map((r) => r.option));
    let nextRank = ranking.length + 1;
    for (const o of options) {
      if (!seen.has(o)) {
        ranking.push({ option: o, rang: nextRank++, begruendung: "" });
      }
    }
    // Stabil sortieren nach Rang
    ranking.sort((a, b) => a.rang - b.rang);
    // Ränge normalisieren (1..n)
    ranking = ranking.map((r, i) => ({ ...r, rang: i + 1 }));

    return json({ marktrecherche, quellen, ranking }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});

function safeParseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const obj = JSON.parse(text);
    return obj && typeof obj === "object" ? (obj as Record<string, unknown>) : null;
  } catch {
    // Versuche das erste vollständige {...} aus dem Text zu greifen
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        const obj = JSON.parse(text.slice(start, end + 1));
        return obj && typeof obj === "object" ? (obj as Record<string, unknown>) : null;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
