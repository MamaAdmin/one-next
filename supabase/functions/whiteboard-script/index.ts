import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { callGemini, geminiErrorStatus } from "../_shared/gemini.ts";

const MODEL = "gemini-2.5-flash";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const admin = createClient(supabaseUrl, serviceKey);

async function requireAdmin(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Nicht angemeldet" }, 401);
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return json({ error: "Nicht angemeldet" }, 401);
  const { data: isAdmin } = await admin.rpc("has_role", {
    _user_id: data.user.id,
    _role: "admin",
  });
  if (!isAdmin) return json({ error: "Keine Berechtigung" }, 403);
  return { userId: data.user.id };
}

function buildPrompt(
  topic: string,
  sceneCount: number,
  title: string,
  scriptType: string,
  scriptHint: string,
  styleLabel: string,
) {
  return `Du bist Autor für Erklär- und Lernvideos (Deutsch, Schweizer Business-Kontext).
Erstelle ein Skript für ein Erklärvideo mit genau ${sceneCount} Abschnitten.
Thema/Briefing: "${topic}"
Arbeitstitel: "${title}"
Visueller Stil: ${styleLabel}
Skriptart: ${scriptType}. ${scriptHint}
Der erste Abschnitt ist ein Hook (Frage, Problem oder überraschende Aussage), der letzte fasst zusammen.


Antworte AUSSCHLIESSLICH mit JSON in genau dieser Form, ohne Markdown:
{"title":"kurzer Videotitel","scenes":[{"heading":"max 5 Wörter","narration":"2-3 Sätze Sprechtext","bullets":["max 6 Wörter","..."],"imagePrompt":"deutsche Bildbeschreibung der Zeichnung, ein Satz, ohne Stilangaben","durationInSeconds":8}]}
Schreibe KI statt AI. Keine Anglizismen-Häufung. bullets: 2-3 Stück.`;
}

function gatewayError(status: number, message: string): string {
  if (status === 401) return "Der KI-Zugang ist nicht konfiguriert.";
  if (status === 402) return message || "Das KI-Guthaben reicht nicht aus. Bitte Credits aufladen.";
  if (status === 403) return message || "Die KI-Nutzung ist für diesen Arbeitsbereich gesperrt.";
  if (status === 429) return "Zu viele Anfragen. Bitte kurz warten und erneut versuchen.";
  if (status >= 500) return "Die KI ist gerade nicht erreichbar. Bitte später erneut versuchen.";
  return message || `KI-Fehler (${status})`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "KI-Zugang ist nicht konfiguriert." }, 500);

    const payload = await req.json().catch(() => ({}));
    const topic = String(payload.topic ?? "").trim();
    if (topic.length < 5) return json({ error: "Bitte ein Thema beschreiben." }, 400);
    const sceneCount = Math.min(Math.max(Number(payload.sceneCount ?? 5), 2), 10);
    const title = String(payload.title ?? "");
    const scriptType = String(payload.scriptType ?? "Problem–Lösung");
    const scriptHint = String(payload.scriptHint ?? "");
    const styleLabel = String(payload.styleLabel ?? "Whiteboard / Legetrick");

    let lastError = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "user",
              content: buildPrompt(topic, sceneCount, title, scriptType, scriptHint, styleLabel),
            },
          ],
        }),
      });

      if (res.ok) {
        const body = await res.json();
        const content: string = body?.choices?.[0]?.message?.content ?? "";
        const match = content.match(/\{[\s\S]*\}/);
        if (!match) return json({ error: "Skript konnte nicht gelesen werden" }, 502);
        return json({ script: JSON.parse(match[0]) });
      }

      const errBody = await res.json().catch(() => null);
      lastError = gatewayError(res.status, errBody?.message ?? errBody?.error?.message ?? "");
      if (res.status !== 429 && res.status < 500) {
        return json({ error: lastError }, res.status === 402 || res.status === 403 ? 402 : 400);
      }
      const retryAfter = Number(res.headers.get("Retry-After"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 1500 * (attempt + 1);
      await new Promise((r) => setTimeout(r, delay));
    }

    return json({ error: lastError || "Skript konnte nicht erstellt werden" }, 503);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return json({ error: message }, 500);
  }
});
