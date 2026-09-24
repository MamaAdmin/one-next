// YouTube-Kanal verbinden (OAuth) und fertige Videos veröffentlichen.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SB_URL, SRK);
const REDIRECT = `${SB_URL}/functions/v1/youtube`;
const EXPECTED_CHANNEL = "UC80BITjnvjLmBTnPh6yYVog";
const SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly";

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const enc = new TextEncoder();
const b64u = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(SRK), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64u(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}
async function signState(o: Record<string, unknown>) {
  const p = b64u(enc.encode(JSON.stringify(o)));
  return `${p}.${await hmac(p)}`;
}
async function readState(s: string) {
  const [p, sig] = s.split(".");
  if (!p || sig !== (await hmac(p))) return null;
  const o = JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
  return o.exp > Date.now() ? o : null;
}

const creds = () => {
  const id = Deno.env.get("YOUTUBE_CLIENT_ID"), secret = Deno.env.get("YOUTUBE_CLIENT_SECRET");
  return id && secret ? { id, secret } : null;
};

async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const c = createClient(SB_URL, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data } = await c.auth.getUser();
  if (!data.user) return null;
  const { data: ok } = await admin.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  return ok ? data.user.id : null;
}

async function accessToken() {
  const c = creds();
  const { data } = await admin.from("youtube_connection").select("refresh_token").eq("id", 1).maybeSingle();
  if (!c || !data?.refresh_token) throw new Error("YouTube-Kanal ist nicht verbunden.");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: c.id, client_secret: c.secret, refresh_token: data.refresh_token, grant_type: "refresh_token" }),
  });
  const t = await r.json();
  if (!r.ok) throw new Error(`Google-Anmeldung abgelaufen, bitte Kanal neu verbinden (${t.error ?? r.status}).`);
  return t.access_token as string;
}

const ytError = (status: number, body: string) => {
  if (body.includes("quotaExceeded") || body.includes("uploadLimitExceeded")) return "Tageslimit von YouTube erreicht – bitte morgen erneut versuchen.";
  if (status === 401) return "YouTube-Anmeldung ungültig – bitte Kanal neu verbinden.";
  return `YouTube-Fehler ${status}: ${body.slice(0, 300)}`;
};

const TARGETS = {
  whiteboard: { table: "whiteboard_videos", bucket: "whiteboard-uploads" },
  lernvideo: { table: "projects", bucket: "lernvideo-assets" },
} as const;

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status") }),
  z.object({ action: z.literal("connect"), returnUrl: z.string().url() }),
  z.object({ action: z.literal("disconnect") }),
  z.object({
    action: z.literal("publish"),
    target: z.enum(["whiteboard", "lernvideo"]),
    id: z.string().uuid(),
    title: z.string().min(1).max(100),
    description: z.string().max(5000).default(""),
    slotKey: z.string().max(100).nullable(),
  }),
]);

async function handleCallback(url: URL) {
  const state = await readState(url.searchParams.get("state") ?? "");
  const ret = state?.ret ?? "/";
  const back = (q: string) => Response.redirect(`${ret}${ret.includes("?") ? "&" : "?"}${q}`, 302);
  if (!state) return new Response("Ungültige Anfrage", { status: 400 });
  const code = url.searchParams.get("code");
  const c = creds();
  if (!code || !c) return back("youtube=error");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: c.id, client_secret: c.secret, redirect_uri: REDIRECT, grant_type: "authorization_code" }),
  });
  const t = await r.json();
  if (!r.ok || !t.refresh_token) { console.error("token", t); return back("youtube=error"); }
  const ch = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers: { Authorization: `Bearer ${t.access_token}` } }).then((x) => x.json());
  const channel = ch.items?.[0];
  if (!channel) return back("youtube=nochannel");
  await admin.from("youtube_connection").upsert({
    id: 1, channel_id: channel.id, channel_title: channel.snippet?.title ?? null,
    refresh_token: t.refresh_token, connected_at: new Date().toISOString(), connected_by: state.uid,
  });
  return back(channel.id === EXPECTED_CHANNEL ? "youtube=connected" : "youtube=otherchannel");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  if (req.method === "GET" && url.searchParams.has("state")) return handleCallback(url);

  try {
    const uid = await requireAdmin(req);
    if (!uid) return json({ error: "Nur für Admins" }, 403);
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
    const b = parsed.data;

    if (b.action === "status") {
      const { data } = await admin.from("youtube_connection").select("channel_id, channel_title, connected_at").eq("id", 1).maybeSingle();
      return json({ configured: !!creds(), redirectUri: REDIRECT, connected: !!data?.channel_id, expectedChannel: EXPECTED_CHANNEL, ...data });
    }
    if (b.action === "connect") {
      const c = creds();
      if (!c) return json({ error: "Google-Zugangsdaten fehlen noch." }, 400);
      const state = await signState({ uid, ret: b.returnUrl, exp: Date.now() + 15 * 60_000 });
      const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      Object.entries({ client_id: c.id, redirect_uri: REDIRECT, response_type: "code", scope: SCOPES, access_type: "offline", prompt: "consent", state })
        .forEach(([k, v]) => auth.searchParams.set(k, v));
      return json({ url: auth.toString() });
    }
    if (b.action === "disconnect") {
      await admin.from("youtube_connection").delete().eq("id", 1);
      return json({ ok: true });
    }

    // publish
    const { table, bucket } = TARGETS[b.target];
    const { data: row } = await admin.from(table).select("export_path, export_srt_path").eq("id", b.id).single();
    if (!row?.export_path) return json({ error: "Es gibt noch kein fertiges Server-MP4." }, 400);
    await admin.from(table).update({ youtube_status: "uploading", youtube_error: null, target_slot_key: b.slotKey }).eq("id", b.id);
    const fail = async (msg: string) => {
      await admin.from(table).update({ youtube_status: "failed", youtube_error: msg }).eq("id", b.id);
      return json({ error: msg }, 400);
    };
    try {
      const token = await accessToken();
      const { data: file, error: dlErr } = await admin.storage.from(bucket).download(row.export_path);
      if (dlErr || !file) return fail("MP4 konnte nicht aus dem Speicher geladen werden.");
      const init = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": String(file.size) },
        body: JSON.stringify({
          snippet: { title: b.title, description: b.description, defaultLanguage: "de", defaultAudioLanguage: "de", categoryId: "27" },
          status: { privacyStatus: "public", selfDeclaredMadeForKids: false },
        }),
      });
      if (!init.ok) return fail(ytError(init.status, await init.text()));
      const up = await fetch(init.headers.get("Location")!, { method: "PUT", headers: { "Content-Type": "video/mp4" }, body: file });
      const upText = await up.text();
      if (!up.ok) return fail(ytError(up.status, upText));
      const video = JSON.parse(upText);
      const ytId = video.id as string;
      const privacy = video.status?.privacyStatus as string | undefined;

      if (row.export_srt_path) {
        const { data: srt } = await admin.storage.from(bucket).download(row.export_srt_path);
        if (srt) {
          const boundary = "yt" + crypto.randomUUID();
          const meta = JSON.stringify({ snippet: { videoId: ytId, language: "de", name: "Deutsch" } });
          const body = new Blob([
            `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`,
            srt, `\r\n--${boundary}--`,
          ]);
          const cr = await fetch("https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet", {
            method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` }, body,
          });
          if (!cr.ok) console.error("captions", cr.status, await cr.text());
        }
      }

      const videoUrl = `https://youtu.be/${ytId}`;
      if (b.slotKey) await admin.from("video_library").update({ slot_key: null }).eq("slot_key", b.slotKey);
      await admin.from("video_library").insert({
        title: b.title, description: b.description || null, video_url: videoUrl, provider: "youtube",
        slot_key: b.slotKey, created_by: uid,
      });
      await admin.from(table).update({ youtube_status: "published", youtube_video_id: ytId, youtube_error: null }).eq("id", b.id);
      return json({ videoId: ytId, url: videoUrl, privacy });
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Unbekannter Fehler");
    }
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }, 500);
  }
});
