import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const KIE_BASE = "https://api.kie.ai";
const BUCKET = "whiteboard-assets";

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

function kieHeaders() {
  const key = Deno.env.get("KIE_AI_API_KEY");
  if (!key) throw new Error("KIE_AI_API_KEY fehlt");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function mirrorToStorage(sourceUrl: string, extension: string): Promise<string> {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`Asset konnte nicht geladen werden (${res.status})`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const path = `${crypto.randomUUID()}.${extension}`;
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const signed = await admin.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signed.error || !signed.data?.signedUrl) {
    throw new Error(signed.error?.message ?? "Signierte URL fehlgeschlagen");
  }
  return signed.data.signedUrl;
}

async function createJobTask(model: string, input: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${KIE_BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: kieHeaders(),
    body: JSON.stringify({ model, input }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.code !== 200 || !body?.data?.taskId) {
    console.error("[createTask] model=", model, "status=", res.status, "body=", JSON.stringify(body)?.slice(0, 600));
    throw new Error(body?.msg ?? body?.message ?? `kie.ai Fehler (${res.status})`);
  }
  return body.data.taskId as string;
}

async function pollJobTask(taskId: string, timeoutMs = 170_000): Promise<string> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`${KIE_BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      headers: kieHeaders(),
    });
    const body = await res.json();
    const state = body?.data?.state;
    if (state === "success") {
      const parsed = JSON.parse(body.data.resultJson ?? "{}");
      const url = parsed?.resultUrls?.[0];
      if (!url) throw new Error("kie.ai lieferte kein Ergebnis");
      return url as string;
    }
    if (state === "fail") {
      console.error("[pollJobTask] fail", JSON.stringify(body?.data)?.slice(0, 600));
      throw new Error(body?.data?.failMsg ?? "Generierung fehlgeschlagen");
    }
  }
  throw new Error("Zeitüberschreitung bei der Generierung");
}

const STYLE_SUFFIX: Record<string, string> = {
  whiteboard:
    "Black ink whiteboard marker line drawing, hand drawn doodle style, clean white background, no text, minimal, high contrast.",
  flat_2d:
    "Flat vector illustration, simple geometric shapes, limited muted color palette, clean light background, no text.",
  character_2d:
    "Friendly 2D character illustration, flat colors, bold outlines, expressive simple faces, clean light background, no text.",
  motion_graphics:
    "Bold motion graphics key visual, geometric icons and shapes, strong accent colors on dark background, no text.",
  infografik:
    "Clean infographic illustration, charts, arrows and process diagram, flat editorial style, light background, no text labels.",
  screencast:
    "Clean software user interface mockup, dashboard with panels and buttons, subtle shadows, light UI design, no readable text.",
  screencast_plus:
    "Software interface mockup combined with flat illustrated icons and callout shapes, light background, no readable text.",
  isometric_3d:
    "Isometric 3D illustration, clean technical render, soft lighting, muted palette, dark neutral background, no text.",
  kinetic_typo:
    "Minimal abstract typographic background texture, bold shapes, high contrast, no readable text.",
  avatar:
    "Friendly illustrated presenter figure, upper body, neutral studio background, flat vector style, no text.",
  // Altwerte aus früheren Videos
  strichzeichnung:
    "Black ink whiteboard marker line drawing, hand drawn doodle style, clean white background, no text, minimal, high contrast.",
  bunte_marker:
    "Colorful whiteboard marker illustration, bold hand drawn strokes, clean white background, no text, playful business doodle.",
  bleistift:
    "Pencil sketch illustration, soft graphite shading, hand drawn on white paper, no text, minimal.",
  kreide:
    "White chalk drawing on a dark green chalkboard, hand drawn, no text, high contrast.",
  comic:
    "Comic cartoon illustration, bold outlines, flat colors, clean white background, no text.",
  business_flat:
    "Flat vector business illustration, simple geometric shapes, limited muted color palette, clean white background, no text.",
};

async function fetchCredits(): Promise<number> {
  const res = await fetch(`${KIE_BASE}/api/v1/chat/credit`, { headers: kieHeaders() });
  if (res.status === 401 || res.status === 403) {
    throw new Error("Kie.ai-Zugang ungültig. Bitte den API-Schlüssel prüfen.");
  }
  if (res.status === 429) throw new Error("Kie.ai-Limit erreicht. Bitte kurz warten.");
  if (!res.ok) throw new Error(`Kie.ai nicht erreichbar (${res.status})`);
  const body = await res.json().catch(() => null);
  const value = typeof body?.data === "number" ? body.data : Number(body?.data?.credits);
  if (!Number.isFinite(value)) throw new Error("Kie.ai lieferte keinen Kontostand");
  return value;
}

const PREVIEW_TEXT =
  "Guten Tag. So klingt diese Stimme in Ihrem Whiteboard-Lernvideo.";

async function voicePreview(voice: string, model: string): Promise<string> {
  const safe = (value: string) => value.replace(/[^a-zA-Z0-9-_]/g, "_");
  const path = `previews/${safe(model)}-${safe(voice)}.mp3`;

  const existing = await admin.storage.from(BUCKET).list("previews", {
    search: path.split("/")[1],
  });
  if (!existing.error && (existing.data ?? []).some((f) => f.name === path.split("/")[1])) {
    const signed = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24);
    if (!signed.error && signed.data?.signedUrl) return signed.data.signedUrl;
  }

  // Der Sprachdienst meldet gelegentlich „Internal Error“ — dann erneut versuchen.
  let remoteUrl: string | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const taskId = await createJobTask(model, { text: PREVIEW_TEXT, voice });
      remoteUrl = await pollJobTask(taskId);
      break;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : "";
      if (!message.includes("Internal Error")) throw err;
    }
  }
  if (!remoteUrl) {
    console.error("[kie-whiteboard] Hörprobe nach 3 Versuchen fehlgeschlagen:", lastError);
    throw new Error(
      "Der Sprachdienst meldet gerade eine Störung. Bitte in ein paar Minuten erneut versuchen — es wurden keine Credits verbraucht.",
    );
  }
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Hörprobe konnte nicht geladen werden (${res.status})`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const upload = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: "audio/mpeg",
    upsert: true,
  });
  if (upload.error) throw new Error(upload.error.message);
  const signed = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24);
  if (signed.error || !signed.data?.signedUrl) {
    throw new Error(signed.error?.message ?? "Signierte URL fehlgeschlagen");
  }
  return signed.data.signedUrl;
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    const payload = await req.json().catch(() => ({}));
    const action = String(payload.action ?? "");

    if (action === "voice_preview") {
      const voice = String(payload.voice ?? "Rachel");
      const model = String(payload.model ?? "elevenlabs/text-to-speech-multilingual-v2");
      const url = await voicePreview(voice, model);
      return json({ url });
    }


    if (action === "credits") {
      const credits = await fetchCredits();
      return json({ credits });
    }

    if (action === "image") {
      const prompt = String(payload.prompt ?? "").trim();
      if (!prompt) return json({ error: "Bildbeschreibung fehlt." }, 400);
      const style = String(payload.style ?? "whiteboard");
      const suffix = STYLE_SUFFIX[style] ?? STYLE_SUFFIX.whiteboard;
      const imageModel = String(payload.model ?? "nano-banana-2");
      const negative = String(payload.negativePrompt ?? "").trim();
      const seed = Number(payload.seed);
      const input: Record<string, unknown> = {
        prompt: `${prompt}. ${suffix}`,
        aspect_ratio: "16:9",
        resolution: "2K",
        output_format: "png",
      };
      if (negative) input.negative_prompt = negative;
      if (Number.isFinite(seed) && seed > 0) input.seed = Math.round(seed);
      // Erstes Bild als Stilreferenz, damit alle Abschnitte gleich aussehen.
      const styleRef = String(payload.styleRefUrl ?? "").trim();
      if (styleRef) input.image_urls = [styleRef];
      const taskId = await createJobTask(imageModel, input);
      const remoteUrl = await pollJobTask(taskId);
      const url = await mirrorToStorage(remoteUrl, "png");
      return json({ url, taskId });
    }

    if (action === "voice") {
      const text = String(payload.text ?? "").trim().slice(0, 4800);
      if (!text) return json({ error: "Sprechtext fehlt." }, 400);
      const voiceModel = String(payload.model ?? "elevenlabs/text-to-speech-multilingual-v2");
      // Der Sprachdienst meldet gelegentlich „Internal Error“ — dann erneut versuchen.
      let remoteUrl: string | null = null;
      let lastError: unknown = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const taskId = await createJobTask(voiceModel, {
            text,
            voice: String(payload.voice ?? "Rachel"),
          });
          remoteUrl = await pollJobTask(taskId);
          break;
        } catch (err) {
          lastError = err;
          const message = err instanceof Error ? err.message : "";
          if (!message.includes("Internal Error")) throw err;
        }
      }
      if (!remoteUrl) {
        console.error("[kie-whiteboard] Stimme nach 3 Versuchen fehlgeschlagen:", lastError);
        throw new Error(
          "Der Sprachdienst meldet gerade eine Störung. Bitte in ein paar Minuten erneut versuchen — es wurden keine Credits verbraucht.",
        );
      }
      const url = await mirrorToStorage(remoteUrl, "mp3");
      return json({ url });
    }

    if (action === "video_start") {
      const prompt = String(payload.prompt ?? "").trim();
      if (!prompt) return json({ error: "Videobeschreibung fehlt." }, 400);
      // Mit Startbild entsteht ein bewegter Clip aus der erzeugten Zeichnung.
      const imageUrl = String(payload.imageUrl ?? "").trim();
      const seconds = Number(payload.seconds);
      const seed = Number(payload.seed);
      // Die Clip-Schnittstelle unterstützt nur diese Modelle.
      const VEO_MODELS = new Set(["veo3_fast", "veo3", "veo3_lite"]);
      const requested = String(payload.model ?? "veo3_fast");
      if (!VEO_MODELS.has(requested)) {
        return json(
          {
            error: `Das Videomodell „${requested}" kann keine Clips erzeugen. Bitte im Briefing „Veo 3 Fast" oder „Veo 3" wählen.`,
          },
          400,
        );
      }
      // Erlaubte Cliplängen: 4, 6 oder 8 Sekunden.
      const allowed = [4, 6, 8];
      const duration = Number.isFinite(seconds) && seconds > 0
        ? allowed.reduce((a, b) => (Math.abs(b - seconds) < Math.abs(a - seconds) ? b : a), 8)
        : 8;
      const body_: Record<string, unknown> = {
        prompt: imageUrl
          ? prompt
          : `${prompt}. Whiteboard animation style, hand drawing black marker illustrations on white paper.`,
        model: requested,
        generationType: imageUrl ? "IMAGE_2_VIDEO" : "TEXT_2_VIDEO",
        aspect_ratio: "16:9",
        duration,
      };
      if (imageUrl) body_.imageUrls = [imageUrl];
      if (Number.isFinite(seed) && seed > 0) body_.seeds = Math.round(seed);
      const res = await fetch(`${KIE_BASE}/api/v1/veo/generate`, {
        method: "POST",
        headers: kieHeaders(),
        body: JSON.stringify(body_),
      });
      const body = await res.json();
      if (!res.ok || body?.code !== 200 || !body?.data?.taskId) {
        return json({ error: body?.msg ?? `kie.ai Fehler (${res.status})` }, 502);
      }
      return json({ taskId: body.data.taskId });
    }

    if (action === "video_status") {
      const taskId = String(payload.taskId ?? "");
      if (!taskId) return json({ error: "taskId fehlt." }, 400);
      const res = await fetch(`${KIE_BASE}/api/v1/veo/record-info?taskId=${taskId}`, {
        headers: kieHeaders(),
      });
      const body = await res.json();
      const flag = body?.data?.successFlag;
      if (flag === 1) {
        const remoteUrl = body?.data?.response?.resultUrls?.[0];
        if (!remoteUrl) return json({ status: "failed", error: "Kein Video erhalten" });
        const url = await mirrorToStorage(remoteUrl, "mp4");
        return json({ status: "done", url });
      }
      if (flag === 2 || flag === 3) {
        return json({ status: "failed", error: body?.data?.errorMessage ?? "Video fehlgeschlagen" });
      }
      return json({ status: "pending" });
    }

    return json({ error: "Unbekannte Aktion" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("[kie-whiteboard] Fehler:", message);
    return json({ error: message }, 500);
  }
});
