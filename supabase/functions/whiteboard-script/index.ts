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
const STYLE_REFERENCE_BUCKET = "whiteboard-uploads";
const MAX_REFERENCE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

const LANGUAGE_NAMES: Record<string, string> = {
  de: "Deutsch",
  en: "Englisch",
  fr: "Französisch",
  it: "Italienisch",
};

function buildPrompt(
  topic: string,
  sceneCount: number,
  title: string,
  scriptType: string,
  scriptHint: string,
  styleLabel: string,
  language: string,
  imageDirection: string,
) {
  const languageName = LANGUAGE_NAMES[language] ?? "Deutsch";
  const isGerman = languageName === "Deutsch";
  const visualDirection = imageDirection
    ? `\nVerbindliche Bildvorgabe für alle Abschnitte: "${imageDirection}"\nDie Bildbeschreibungen müssen diese Vorgabe konkret berücksichtigen, ohne sie nur wörtlich zu wiederholen.`
    : "";
  return `Du bist Autor für Erklär- und Lernvideos (${languageName}${isGerman ? ", Schweizer Business-Kontext" : ""}).
Erstelle ein Skript für ein Erklärvideo mit genau ${sceneCount} Abschnitten.
  WICHTIG: Sämtliche Texte (Titel, Überschriften, Sprechtext, Stichpunkte, Bild- und Bewegungsbeschreibungen) schreibst du vollständig auf ${languageName}.
  ${isGerman ? 'Für das Feld "narration" gilt deutsche Standardschreibung: Verwende bei jedem entsprechenden Wort konsequent „ß“ statt „ss“ (zum Beispiel „groß“, „Straße“, „heißt“, „außer“). Schreibe dort niemals die schweizerische ss-Schreibweise.' : ""}
Thema/Briefing: "${topic}"
Arbeitstitel: "${title}"
Visueller Stil: ${styleLabel}
${visualDirection}
Skriptart: ${scriptType}. ${scriptHint}
Der erste Abschnitt ist ein Hook (Frage, Problem oder überraschende Aussage), der letzte fasst zusammen.


Antworte AUSSCHLIESSLICH mit JSON in genau dieser Form, ohne Markdown:
{"title":"kurzer Videotitel","scenes":[{"heading":"max 5 Wörter","narration":"2-3 Sätze Sprechtext","bullets":["max 6 Wörter","..."],"imagePrompt":"Bildbeschreibung der Zeichnung, ein Satz, ohne Stilangaben","motionPrompt":"ein Satz, was sich im Bild bewegt (Kamera, Figuren, Objekte)","durationInSeconds":8}]}
  Schreibe KI statt AI. Keine Anglizismen-Häufung. bullets: 2-3 Stück.`;
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

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function analyzeStyleReference(path: string): Promise<string> {
  if (!path.startsWith("style-references/") || path.includes("..")) {
    throw Object.assign(new Error("Ungültiger Pfad für das Referenzbild."), { status: 400 });
  }
  const { data, error } = await admin.storage.from(STYLE_REFERENCE_BUCKET).download(path);
  if (error || !data) {
    throw Object.assign(new Error("Das Referenzbild konnte nicht geladen werden."), { status: 404 });
  }
  if (data.size === 0 || data.size > MAX_REFERENCE_BYTES) {
    throw Object.assign(new Error("Das Referenzbild ist leer oder grösser als 10 MB."), { status: 400 });
  }
  const extension = path.split(".").pop()?.toLowerCase();
  const fallbackType = extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "image/jpeg";
  const mimeType = ALLOWED_IMAGE_TYPES.has(data.type) ? data.type : fallbackType;
  const imageData = bytesToBase64(new Uint8Array(await data.arrayBuffer()));
  const result = await callGemini({
    model: MODEL,
    temperature: 0.3,
    maxOutputTokens: 500,
    thinkingBudget: 0,
    messages: [{
      role: "user",
      content: [
        {
          text: `Analysiere dieses Referenzbild und formuliere daraus eine präzise deutsche Bildvorgabe für eine zusammenhängende Erklärvideo-Serie. Beschreibe nur übertragbare visuelle Eigenschaften: Farbwelt, Illustrations- oder Figurenstil, Perspektive, Licht, Formen, Linien, Materialien, Komposition und Stimmung. Übernimm keine konkreten Bildinhalte, Namen, Marken, Logos oder sichtbaren Texte als feste Vorgabe. Schreibe einen kompakten Absatz mit 60 bis 100 Wörtern, direkt als Anweisung für ein Bildmodell. Keine Überschrift, keine Aufzählung, kein Markdown.`,
        },
        { inlineData: { mimeType, data: imageData } },
      ],
    }],
  });
  const prompt = result.content.trim();
  if (!prompt) throw Object.assign(new Error("Gemini hat keine Bildvorgabe zurückgegeben."), { status: 502 });
  return prompt;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    const payload = await req.json().catch(() => ({}));
    if (payload.action === "analyze_style_reference") {
      const styleRefPath = String(payload.styleRefPath ?? "").trim();
      if (!styleRefPath) return json({ error: "Bitte zuerst ein Referenzbild hochladen." }, 400);
      try {
        const imageDirection = await analyzeStyleReference(styleRefPath);
        return json({ imageDirection });
      } catch (error) {
        const status = (error as { status?: number })?.status;
        if (status === 400 || status === 404) {
          return json({ error: error instanceof Error ? error.message : "Referenzbild ungültig" }, status);
        }
        const mapped = geminiError(error);
        return json({ error: mapped.message }, mapped.status);
      }
    }
    const topic = String(payload.topic ?? "").trim();
    if (topic.length < 5) return json({ error: "Bitte ein Thema beschreiben." }, 400);
    const sceneCount = Math.min(Math.max(Number(payload.sceneCount ?? 5), 2), 10);
    const title = String(payload.title ?? "");
    const scriptType = String(payload.scriptType ?? "Problem–Lösung");
    const scriptHint = String(payload.scriptHint ?? "");
    const styleLabel = String(payload.styleLabel ?? "Whiteboard / Legetrick");
    const language = String(payload.language ?? "de").slice(0, 5);
    const imageDirection = String(payload.imageDirection ?? "").trim().slice(0, 2000);

    const prompt = buildPrompt(topic, sceneCount, title, scriptType, scriptHint, styleLabel, language, imageDirection);
    let lastError: { status: number; message: string } | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await callGemini({
          model: MODEL,
          json: true,
          messages: [{ role: "user", content: prompt }],
        });
        const match = result.content.match(/\{[\s\S]*\}/);
        if (!match) return json({ error: "Skript konnte nicht gelesen werden" }, 502);
        return json({ script: JSON.parse(match[0]) });
      } catch (err) {
        lastError = geminiError(err);
        const status = (err as { status?: number })?.status ?? 500;
        if (status !== 429 && status < 500) {
          return json({ error: lastError.message }, lastError.status);
        }
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }

    return json({ error: lastError?.message || "Skript konnte nicht erstellt werden" }, lastError?.status ?? 503);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return json({ error: message }, 500);
  }
});
