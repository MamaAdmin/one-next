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

function buildPrompt(heading: string, bullets: string[], imagePrompt: string, styleLabel: string): string {
  return `Du bist Regisseur für Erklärvideos (Deutsch, Schweizer Business-Kontext).
Für einen Abschnitt eines Videos sollst du Vorschläge machen, was sich im Bild bewegt.

Abschnitt: "${heading}"
Stichpunkte: ${bullets.join(" · ")}
Bildbeschreibung: ${imagePrompt}
Stil: ${styleLabel}

Schlage genau 3 verschiedene Bewegungsideen vor – von dezent bis dynamisch.
Jeder Vorschlag ist ein Satz auf Deutsch, der Kamera, Figuren und Objekte beschreibt.
Keine Stilangaben, keine技术ischen Begriffe, nur lesbare Bewegungsbeschreibungen.

Antworte AUSSCHLIESSLICH mit JSON in dieser Form, ohne Markdown:
{"suggestions":["Vorschlag 1","Vorschlag 2","Vorschlag 3"]}`;
}

function geminiError(err: unknown): { status: number; message: string } {
  const status = (err as { status?: number })?.status ?? 500;
  const message = err instanceof Error ? err.message : "";
  if (message.includes("GEMINI_API_KEY")) {
    return { status: 500, message: "Der KI-Zugang (Gemini) ist nicht konfiguriert." };
  }
  if (status === 429) return { status: 429, message: "Zu viele Anfragen. Bitte kurz warten und erneut versuchen." };
  if (status === 401 || status === 403) {
    return { status: 502, message: "Der Gemini-Schlüssel wurde abgelehnt. Bitte den Schlüssel prüfen." };
  }
  if (status >= 500) return { status: 503, message: "Die KI ist gerade nicht erreichbar. Bitte später erneut versuchen." };
  return { status: geminiErrorStatus(err), message: message || `KI-Fehler (${status})` };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    const payload = await req.json().catch(() => ({}));
    const heading = String(payload.heading ?? "").trim();
    if (heading.length < 2) return json({ error: "Abschnitt fehlt." }, 400);
    const bullets: string[] = Array.isArray(payload.bullets) ? payload.bullets.map(String) : [];
    const imagePrompt = String(payload.imagePrompt ?? "");
    const styleLabel = String(payload.styleLabel ?? "Whiteboard / Legetrick");

    const prompt = buildPrompt(heading, bullets, imagePrompt, styleLabel);
    let lastError: { status: number; message: string } | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await callGemini({
          model: MODEL,
          json: true,
          messages: [{ role: "user", content: prompt }],
          maxOutputTokens: 1024,
        });
        const match = result.content.match(/\{[\s\S]*\}/);
        if (!match) return json({ error: "Vorschläge konnten nicht gelesen werden" }, 502);
        const parsed = JSON.parse(match[0]) as { suggestions?: string[] };
        const suggestions = (parsed.suggestions ?? []).filter((s) => typeof s === "string" && s.trim());
        if (suggestions.length === 0) return json({ error: "Keine Vorschläge erhalten" }, 502);
        return json({ suggestions });
      } catch (err) {
        lastError = geminiError(err);
        const status = (err as { status?: number })?.status ?? 500;
        if (status !== 429 && status < 500) {
          return json({ error: lastError.message }, lastError.status);
        }
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }

    return json({ error: lastError?.message || "Vorschläge konnten nicht erstellt werden" }, lastError?.status ?? 503);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return json({ error: message }, 500);
  }
});
