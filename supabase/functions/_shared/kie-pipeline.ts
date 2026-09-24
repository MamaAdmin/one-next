// Gemeinsame Logik der Lernvideo-Pipeline (Kie.ai). Nur serverseitig verwenden.
import { createClient } from "npm:@supabase/supabase-js@2";

export const KIE_BASE = "https://api.kie.ai";
export const ASSET_BUCKET = "lernvideo-assets";
export const TIMEOUT_MS = 10 * 60 * 1000;

export const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

export type ErrorKind = "content_filter" | "rate_limit" | "credits" | "timeout" | "invalid" | "unknown";

export class KieError extends Error {
  constructor(message: string, public kind: ErrorKind) {
    super(message);
  }
}

export function kieKey(): string {
  const key = Deno.env.get("KIE_API_KEY") ?? Deno.env.get("KIE_AI_API_KEY");
  if (!key) throw new KieError("KIE_API_KEY fehlt", "invalid");
  return key;
}

const kieHeaders = () => ({ Authorization: `Bearer ${kieKey()}`, "Content-Type": "application/json" });

/** Ordnet Kie.ai-Fehler verständlichen Kategorien zu. */
export function classify(code: number | undefined, msg: string): ErrorKind {
  const m = msg.toLowerCase();
  if (code === 402 || /insufficient|credit|balance/.test(m)) return "credits";
  if (code === 429 || /rate limit|too many|frequency/.test(m)) return "rate_limit";
  if (/sensitive|content policy|safety|nsfw|moderation|flagged|violat|prohibited|filter/.test(m)) return "content_filter";
  if (code === 400 || code === 422) return "invalid";
  return "unknown";
}

export const ERROR_LABEL: Record<ErrorKind, string> = {
  content_filter: "Prompt vom Inhaltsfilter abgelehnt",
  rate_limit: "Zu viele Anfragen (Rate-Limit), bitte später erneut versuchen",
  credits: "Zu wenig Kie.ai-Credits",
  timeout: "Zeitüberschreitung: kein Ergebnis nach 10 Minuten",
  invalid: "Ungültige Anfrage",
  unknown: "Generierung fehlgeschlagen",
};

export async function createKieTask(
  api: string,
  model: string,
  input: Record<string, unknown>,
  callBackUrl: string,
): Promise<string> {
  const isVeo = api === "veo";
  const url = isVeo ? `${KIE_BASE}/api/v1/veo/generate` : `${KIE_BASE}/api/v1/jobs/createTask`;
  const payload = isVeo ? { ...input, model, callBackUrl } : { model, input, callBackUrl };
  const res = await fetch(url, { method: "POST", headers: kieHeaders(), body: JSON.stringify(payload) });
  const body = await res.json().catch(() => null);
  const code = Number(body?.code ?? res.status);
  if (!res.ok || code !== 200 || !body?.data?.taskId) {
    const msg = String(body?.msg ?? body?.message ?? `Kie.ai Fehler (${res.status})`);
    console.error("[kie createTask]", model, res.status, JSON.stringify(body)?.slice(0, 500));
    throw new KieError(msg, classify(code, msg));
  }
  return body.data.taskId as string;
}

type TaskResult =
  | { state: "pending" }
  | { state: "success"; url: string; credits?: number }
  | { state: "fail"; message: string; kind: ErrorKind };

export async function fetchKieTask(api: string, taskId: string): Promise<TaskResult> {
  const id = encodeURIComponent(taskId);
  const url = api === "veo"
    ? `${KIE_BASE}/api/v1/veo/record-info?taskId=${id}`
    : `${KIE_BASE}/api/v1/jobs/recordInfo?taskId=${id}`;
  const res = await fetch(url, { headers: kieHeaders() });
  const body = await res.json().catch(() => null);
  const code = Number(body?.code ?? res.status);
  if (!res.ok || code !== 200) {
    const msg = String(body?.msg ?? `Kie.ai nicht erreichbar (${res.status})`);
    if (code === 429 || res.status >= 500) return { state: "pending" };
    return { state: "fail", message: msg, kind: classify(code, msg) };
  }
  const d = body?.data ?? {};
  if (api === "veo") {
    const flag = Number(d.successFlag);
    if (flag === 1) {
      let urls = d.response?.resultUrls ?? d.resultUrls;
      if (typeof urls === "string") urls = JSON.parse(urls);
      return urls?.[0] ? { state: "success", url: urls[0] } : { state: "fail", message: "Kein Ergebnis", kind: "unknown" };
    }
    if (flag === 2 || flag === 3) {
      const msg = String(d.errorMessage ?? "Videoerzeugung fehlgeschlagen");
      return { state: "fail", message: msg, kind: classify(Number(d.errorCode), msg) };
    }
    return { state: "pending" };
  }
  if (d.state === "success") {
    const parsed = typeof d.resultJson === "string" ? JSON.parse(d.resultJson || "{}") : d.resultJson ?? {};
    const out = parsed?.resultUrls?.[0] ?? parsed?.resultUrl;
    return out
      ? { state: "success", url: out, credits: d.creditsConsumed != null ? Number(d.creditsConsumed) : undefined }
      : { state: "fail", message: "Kie.ai lieferte kein Ergebnis", kind: "unknown" };
  }
  if (d.state === "fail") {
    const msg = String(d.failMsg ?? "Generierung fehlgeschlagen");
    return { state: "fail", message: msg, kind: classify(Number(d.failCode), msg) };
  }
  return { state: "pending" };
}

const EXT: Record<string, string> = { image: "png", audio: "mp3", video: "mp4", avatar: "mp4" };

type AssetRow = {
  id: string;
  type: string;
  api: string;
  status: string;
  kie_task_id: string | null;
  started_at: string | null;
  scene_id: string | null;
};

/** Holt den aktuellen Stand bei Kie.ai, lädt fertige Dateien sofort in den Speicher und setzt den Status. */
export async function syncAsset(asset: AssetRow): Promise<string> {
  if (asset.status === "done" || asset.status === "failed" || !asset.kie_task_id) return asset.status;

  const started = asset.started_at ? new Date(asset.started_at).getTime() : Date.now();
  const result = await fetchKieTask(asset.api, asset.kie_task_id);

  if (result.state === "pending") {
    if (Date.now() - started > TIMEOUT_MS) {
      await markFailed(asset.id, ERROR_LABEL.timeout, "timeout");
      return "failed";
    }
    return "running";
  }
  if (result.state === "fail") {
    await markFailed(asset.id, `${ERROR_LABEL[result.kind]}: ${result.message}`, result.kind);
    return "failed";
  }

  const res = await fetch(result.url);
  if (!res.ok) {
    await markFailed(asset.id, `Datei konnte nicht geladen werden (${res.status})`, "unknown");
    return "failed";
  }
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const fromType = contentType.split("/")[1]?.split(";")[0];
  const ext = fromType && /^(png|jpeg|jpg|webp|mp3|mpeg|wav|mp4)$/.test(fromType)
    ? fromType.replace("mpeg", "mp3").replace("jpeg", "jpg")
    : EXT[asset.type] ?? "bin";
  const path = `${asset.scene_id ?? "tests"}/${asset.id}.${ext}`;
  const { error } = await admin.storage.from(ASSET_BUCKET).upload(path, new Uint8Array(await res.arrayBuffer()), {
    contentType,
    upsert: true,
  });
  if (error) {
    await markFailed(asset.id, `Speichern fehlgeschlagen: ${error.message}`, "unknown");
    return "failed";
  }
  await admin.from("assets").update({
    status: "done",
    storage_path: path,
    cost_credits: result.credits ?? null,
    error_message: null,
    error_kind: null,
    finished_at: new Date().toISOString(),
  }).eq("id", asset.id);
  return "done";
}

export async function markFailed(id: string, message: string, kind: ErrorKind) {
  await admin.from("assets").update({
    status: "failed",
    error_message: message,
    error_kind: kind,
    finished_at: new Date().toISOString(),
  }).eq("id", id);
}
