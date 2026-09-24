// Erzeugt aus Thema, Zielgruppe, Lernziel und Länge ein Skript und teilt es in Szenen auf.
// Läuft über das eigene Gemini-Konto (keine Lovable-Credits).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { callGemini } from "../_shared/gemini.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const Body = z.object({
  projectId: z.string().uuid(),
  styleLabel: z.string().max(120),
  scriptType: z.string().max(300),
});

const schema = {
  type: "OBJECT",
  properties: {
    scenes: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          narration: { type: "STRING" },
          image_prompt: { type: "STRING" },
          overlay_texts: { type: "ARRAY", items: { type: "STRING" } },
          duration_seconds: { type: "NUMBER" },
        },
        required: ["narration", "image_prompt", "overlay_texts", "duration_seconds"],
      },
    },
  },
  required: ["scenes"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = req.headers.get("Authorization") ?? "";
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: u } = await client.auth.getUser();
  if (!u.user) return json({ error: "Nicht angemeldet" }, 401);
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
  if (!isAdmin) return json({ error: "Keine Berechtigung" }, 403);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
  const { projectId, styleLabel, scriptType } = parsed.data;

  const { data: p } = await admin.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (!p) return json({ error: "Projekt nicht gefunden" }, 404);
  if (!p.topic.trim()) return json({ error: "Bitte zuerst ein Thema eingeben" }, 400);

  const characters = (p.characters as Array<{ name: string; description: string }>) ?? [];
  const prompt = `Du schreibst das Skript für ein Lernvideo.

Thema: ${p.topic}
Zielgruppe: ${p.audience || "allgemein"}
Lernziel: ${p.learning_goal || "Verständnis des Themas"}
Ziellänge: ${p.target_seconds} Sekunden gesprochener Text
Stil: ${styleLabel}
Skriptart (verbindliche Struktur): ${scriptType}
Sprache: ${p.language === "de-CH" ? "Deutsch für die Schweiz (ss statt ß)" : p.language}
${characters.length ? `Figuren (nur mit diesen Namen verwenden): ${characters.map((c) => c.name).join(", ")}` : ""}

Regeln:
- Folge der Skriptart Schritt für Schritt; jeder Abschnitt der Struktur ergibt eine oder mehrere Szenen.
- Rechne mit etwa 2,3 gesprochenen Wörtern pro Sekunde; die Summe der Szenendauern entspricht der Ziellänge.
- Pro Szene 4 bis 15 Sekunden.
- narration: gesprochener Sprechertext, natürlich, kurze Sätze, "KI" statt "AI".
- image_prompt: englische Bildbeschreibung ohne Stilangaben und ohne Text im Bild. Nenne Figuren mit Namen, wenn sie vorkommen.
- overlay_texts: 0 bis 3 sehr kurze Einblendungen auf Deutsch (Schlagworte, Zahlen).
- duration_seconds: geschätzte Dauer der Szene.`;

  try {
    const res = await callGemini({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      json: true,
      responseSchema: schema,
      temperature: 0.6,
      thinkingBudget: 0,
    });
    const scenes = (JSON.parse(res.content).scenes ?? []) as Array<{
      narration: string; image_prompt: string; overlay_texts: string[]; duration_seconds: number;
    }>;
    if (!scenes.length) return json({ error: "Kein Skript erzeugt" }, 502);

    await admin.from("scenes").delete().eq("project_id", projectId);
    const { error } = await admin.from("scenes").insert(
      scenes.map((s, i) => ({
        project_id: projectId,
        position: i,
        narration: s.narration,
        image_prompt: s.image_prompt,
        overlay_texts: s.overlay_texts ?? [],
        duration_seconds: Math.round(Number(s.duration_seconds) || 6),
      })),
    );
    if (error) return json({ error: error.message }, 500);
    await admin.from("projects").update({ status: "script" }).eq("id", projectId);
    return json({ count: scenes.length });
  } catch (e) {
    console.error("[lernvideo-script]", e);
    return json({ error: e instanceof Error ? e.message : "Skript fehlgeschlagen" }, 502);
  }
});
