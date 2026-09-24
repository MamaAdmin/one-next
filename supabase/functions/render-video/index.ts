// Übersetzt die Lernvideo-Timeline (JSON) in Creatomate-RenderScript, startet den Render
// und übernimmt das fertige MP4 samt SRT in den eigenen Speicher.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const API = "https://api.creatomate.com/v2/renders";
const BUCKET = "lernvideo-assets";
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// ---------- Timeline-Schema (Spiegel von src/features/lernvideo/timeline.ts) ----------
const OverlayT = z.object({
  id: z.string(),
  type: z.enum(["title", "term", "number", "list", "bar", "pie", "subtitle"]),
  text: z.string().max(500),
  detail: z.string().max(500).optional(),
  value: z.number().optional(),
  suffix: z.string().max(20).optional(),
  items: z.array(z.string().max(200)).max(12).optional(),
  data: z.array(z.object({ label: z.string().max(60), value: z.number() })).max(10).optional(),
  position: z.enum(["top", "center", "bottom", "left", "right"]),
  start: z.number().min(0),
  duration: z.number().min(0.1),
});
const Timeline = z.object({
  version: z.literal(1),
  title: z.string().max(300),
  format: z.enum(["16:9", "9:16"]),
  width: z.number().int().min(320).max(3840),
  height: z.number().int().min(320).max(3840),
  duration: z.number().min(0.1).max(1800),
  music: z.object({ url: z.string().url(), volume: z.number().min(0).max(1), duckFactor: z.number().min(0).max(1) }).optional(),
  scenes: z.array(z.object({
    id: z.string(),
    index: z.number().int(),
    start: z.number().min(0),
    duration: z.number().min(0.1),
    visual: z.object({
      kind: z.enum(["video", "image", "fallback", "whiteboard", "kinetic", "none"]),
      videoUrl: z.string().url().optional(),
      imageUrl: z.string().url().optional(),
      clipSeconds: z.number().optional(),
    }),
    audio: z.object({ url: z.string().url(), duration: z.number() }).optional(),
    narration: z.string().max(5000),
    overlays: z.array(OverlayT).max(30),
  })).min(1).max(60),
  subtitles: z.array(z.object({ start: z.number(), end: z.number(), text: z.string().max(300) })).max(1000),
});
type TL = z.infer<typeof Timeline>;
type Ov = z.infer<typeof OverlayT>;

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), projectId: z.string().uuid(), timeline: Timeline, subtitles: z.boolean().default(true), dryRun: z.boolean().optional() }),
  z.object({ action: z.literal("status"), projectId: z.string().uuid() }),
]);

// ---------- Layout (identisch zur Browser-Vorschau) ----------
const C = { cream: "#F3EFE9", slate: "#2F4254", accent: "#5A7A9A", tint: "#E3EBF3", charcoal: "#29231F", card: "rgba(250,248,244,0.92)" };
const FONT = "Inter";

function overlayBox(type: Ov["type"], position: Ov["position"], format: TL["format"]) {
  if (type === "subtitle") return format === "16:9" ? { x: 10, y: 84, w: 80, h: 10 } : { x: 6, y: 76, w: 88, h: 10 };
  const chart = type === "bar" || type === "pie";
  if (format === "16:9") {
    switch (position) {
      case "top": return { x: 10, y: 6, w: 80, h: chart ? 34 : 20 };
      case "bottom": return { x: 10, y: chart ? 52 : 64, w: 80, h: chart ? 30 : 18 };
      case "left": return { x: 5, y: 18, w: 38, h: 60 };
      case "right": return { x: 57, y: 18, w: 38, h: 60 };
      default: return { x: 15, y: chart ? 20 : 35, w: 70, h: chart ? 56 : 30 };
    }
  }
  switch (position) {
    case "top": case "left": return { x: 6, y: 8, w: 88, h: chart ? 30 : 20 };
    case "bottom": case "right": return { x: 6, y: chart ? 42 : 52, w: 88, h: chart ? 30 : 20 };
    default: return { x: 6, y: chart ? 30 : 36, w: 88, h: chart ? 34 : 26 };
  }
}

type El = Record<string, unknown>;
const pct = (n: number) => `${Math.round(n * 100) / 100}%`;
const fadeInOut = (d: number) => [
  { type: "fade", time: 0, duration: Math.min(0.4, d / 3) },
  { type: "fade", time: "end", duration: Math.min(0.3, d / 3), reversed: true },
];

function overlayElements(o: Ov, tl: TL, time: number, track: number): El[] {
  const b = overlayBox(o.type, o.position, tl.format);
  const W = tl.width;
  const portrait = tl.format === "9:16";
  const fs = (landscape: number, port: number) => Math.round(((portrait ? port : landscape) * W) / 100);
  const box = (x: number, y: number, w: number, h: number): El => ({
    x: pct(x), y: pct(y), width: pct(w), height: pct(h), x_anchor: "0%", y_anchor: "0%",
  });
  const common = { time, duration: o.duration, track, font_family: FONT };
  const text = (t: string, extra: El): El => ({
    type: "text", text: t, fill_color: C.slate, x_alignment: "0%", y_alignment: "50%", ...common, ...extra,
    animations: fadeInOut(o.duration),
  });

  switch (o.type) {
    case "title":
      return [text(o.text, { ...box(b.x, b.y, b.w, b.h), font_weight: "600", font_size: fs(3.6, 6.4), background_color: C.card, background_x_padding: "12%", background_y_padding: "20%" })];
    case "term":
      return [
        text(o.text, { ...box(b.x, b.y, b.w, b.h * 0.5), font_weight: "600", font_size: fs(2.6, 5), background_color: C.card }),
        ...(o.detail ? [text(o.detail, { ...box(b.x, b.y + b.h * 0.5, b.w, b.h * 0.5), font_size: fs(1.7, 3.4), fill_color: C.charcoal, y_alignment: "0%", track: track + 1 })] : []),
      ];
    case "number": {
      const n = o.value ?? 0;
      const num = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
      return [
        { ...text(`${num}${o.suffix ?? ""}`, { ...box(b.x, b.y, b.w, b.h * 0.65), font_weight: "700", font_size: fs(8, 16), x_alignment: "50%" }),
          animations: [...fadeInOut(o.duration), { type: "text-counter", counting_start: 0, counting_duration: Math.min(1.2, o.duration * 0.6) }] },
        text(o.text, { ...box(b.x, b.y + b.h * 0.65, b.w, b.h * 0.35), font_size: fs(2, 4.2), x_alignment: "50%", y_alignment: "0%", fill_color: C.charcoal, track: track + 1 }),
      ];
    }
    case "list": {
      const body = [o.text, ...(o.items ?? []).map((i) => `• ${i}`)].filter(Boolean).join("\n");
      return [{ ...text(body, { ...box(b.x, b.y, b.w, b.h), font_size: fs(1.8, 3.8), background_color: C.card, line_height: "140%" }),
        animations: [{ type: "text-appear", split: "line", duration: Math.min(2, o.duration * 0.6) }, { type: "fade", time: "end", duration: 0.3, reversed: true }] }];
    }
    case "bar": {
      const data = o.data ?? [];
      const max = Math.max(1, ...data.map((d) => d.value));
      const els: El[] = [];
      if (o.text) els.push(text(o.text, { ...box(b.x, b.y, b.w, b.h * 0.15), font_weight: "600", font_size: fs(2, 4.2) }));
      const areaY = b.y + b.h * 0.18, areaH = b.h * 0.64;
      const slot = b.w / Math.max(1, data.length);
      data.forEach((d, i) => {
        const h = (d.value / max) * areaH;
        els.push({ type: "shape", ...common, track: track + 1, ...box(b.x + i * slot + slot * 0.15, areaY + areaH - h, slot * 0.7, h),
          path: "M 0 0 L 100 0 L 100 100 L 0 100 Z", fill_color: C.slate,
          animations: [{ type: "scale", axis: "y", y_anchor: "100%", start_scale: "0%", duration: 1, fade: false }, { type: "fade", time: "end", duration: 0.3, reversed: true }] });
        els.push(text(String(d.value), { ...box(b.x + i * slot, areaY + areaH - h - b.h * 0.08, slot, b.h * 0.08), font_size: fs(1.4, 3), x_alignment: "50%", track: track + 2 }));
        els.push(text(d.label, { ...box(b.x + i * slot, areaY + areaH + b.h * 0.02, slot, b.h * 0.14), font_size: fs(1.2, 2.6), x_alignment: "50%", fill_color: C.charcoal, track: track + 2 }));
      });
      return els;
    }
    case "pie": {
      const data = o.data ?? [];
      const total = data.reduce((a, d) => a + d.value, 0) || 1;
      const colors = [C.slate, C.accent, "#8A8177", "#CFC6BA"];
      const els: El[] = [];
      // Kreis: quadratisch in Pixel, links in der Box
      const sizePx = Math.min((b.h / 100) * tl.height, (b.w / 100) * W * 0.45);
      const wPct = (sizePx / W) * 100, hPct = (sizePx / tl.height) * 100;
      const cy = b.y + (b.h - hPct) / 2;
      let a0 = -90;
      data.forEach((d, i) => {
        const sweep = (d.value / total) * 360;
        const pts: string[] = ["M 50 50"];
        const steps = Math.max(2, Math.ceil(sweep / 6));
        for (let s = 0; s <= steps; s++) {
          const a = ((a0 + (sweep * s) / steps) * Math.PI) / 180;
          pts.push(`L ${(50 + 50 * Math.cos(a)).toFixed(2)} ${(50 + 50 * Math.sin(a)).toFixed(2)}`);
        }
        pts.push("Z");
        els.push({ type: "shape", ...common, track: track + 1, ...box(b.x, cy, wPct, hPct), path: pts.join(" "), fill_color: colors[i % colors.length],
          animations: [{ type: "fade", time: 0.15 * i, duration: 0.5 }, { type: "fade", time: "end", duration: 0.3, reversed: true }] });
        a0 += sweep;
      });
      const legend = [o.text, ...data.map((d) => `${d.label} ${Math.round((d.value / total) * 100)} %`)].filter(Boolean).join("\n");
      els.push(text(legend, { ...box(b.x + wPct + 3, b.y, b.w - wPct - 3, b.h), font_size: fs(1.6, 3.2), line_height: "150%", track: track + 2 }));
      return els;
    }
    default:
      return [text(o.text, { ...box(b.x, b.y, b.w, b.h), x_alignment: "50%", font_size: fs(2, 4), fill_color: C.cream, background_color: "rgba(41,35,31,0.8)" })];
  }
}

function toRenderScript(tl: TL, withSubtitles: boolean): El {
  const scenes: El[] = tl.scenes.map((s) => {
    const els: El[] = [];
    const v = s.visual;
    if (v.kind === "video" && v.videoUrl) {
      if (v.imageUrl) els.push({ type: "image", track: 1, source: v.imageUrl, duration: null }); // Standbild hält, falls der Clip kürzer ist
      els.push({ type: "video", track: 2, source: v.videoUrl, volume: "0%", duration: Math.min(v.clipSeconds ?? s.duration, s.duration) });
    } else if ((v.kind === "fallback" || v.kind === "image") && v.imageUrl) {
      els.push({ type: "image", track: 1, source: v.imageUrl, duration: null,
        animations: [{ type: "scale", start_scale: "100%", end_scale: "108%", fade: false, easing: "linear" }] });
    } else if (v.kind === "whiteboard" && v.imageUrl) {
      els.push({ type: "image", track: 1, source: v.imageUrl, fit: "contain", duration: null,
        animations: [{ type: "wipe", time: 0, duration: Math.max(1, s.duration * 0.7), direction: 0, easing: "linear" }] });
    } else if (v.kind === "kinetic") {
      if (v.imageUrl) els.push({ type: "image", track: 1, source: v.imageUrl, duration: null, opacity: "20%" });
      els.push({ type: "text", track: 2, text: s.narration, font_family: FONT, font_weight: "700", fill_color: C.slate,
        width: "84%", height: "70%", x_alignment: "50%", y_alignment: "50%", duration: null,
        animations: [{ type: "text-appear", split: "word", duration: Math.max(1, s.audio?.duration ?? s.duration) }] });
    }
    if (s.audio) els.push({ type: "audio", track: 3, source: s.audio.url, duration: null });
    s.overlays.forEach((o, i) => els.push(...overlayElements(o, tl, o.start, 10 + i * 3)));
    return { type: "composition", name: `Szene-${s.index + 1}`, track: 1, duration: s.duration, elements: els };
  });

  const root: El[] = [...scenes];
  if (tl.music) {
    const m = tl.music;
    tl.scenes.forEach((s) => {
      const speak = Math.min(s.audio?.duration ?? 0, s.duration);
      const seg = (t: number, d: number, vol: number) => d > 0.05 && root.push({
        type: "audio", track: 2, source: m.url, time: t, duration: d, trim_start: t, volume: pct(vol * 100),
      });
      seg(s.start, speak, m.volume * m.duckFactor);
      seg(s.start + speak, s.duration - speak, m.volume);
    });
  }
  if (withSubtitles) {
    tl.subtitles.forEach((c) => root.push(...overlayElements(
      { id: "sub", type: "subtitle", text: c.text, position: "bottom", start: c.start, duration: Math.max(0.2, c.end - c.start) },
      tl, c.start, 4)));
  }
  return { output_format: "mp4", width: tl.width, height: tl.height, frame_rate: 30, fill_color: C.cream, elements: root };
}

// ---------- SRT ----------
const pad = (n: number, l = 2) => String(Math.floor(n)).padStart(l, "0");
const srtTime = (s: number) => `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)},${pad((s % 1) * 1000, 3)}`;
const toSrt = (cues: TL["subtitles"]) => "\uFEFF" + cues.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join("\n");

async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data } = await client.auth.getUser();
  if (!data.user) return null;
  const { data: ok } = await admin.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  return ok ? data.user.id : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!(await requireAdmin(req))) return json({ error: "Nur für Admins" }, 403);
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
    const key = Deno.env.get("CREATOMATE_API_KEY");
    if (!key) return json({ error: "Der Creatomate-Schlüssel fehlt noch." }, 400);
    const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
    const body = parsed.data;

    if (body.action === "start") {
      const script = toRenderScript(body.timeline, body.subtitles);
      const res = await fetch(API, { method: "POST", headers, body: JSON.stringify({ ...script, dry_run: body.dryRun || undefined, metadata: body.projectId }) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("creatomate", res.status, JSON.stringify(out));
        const msg = res.status === 401 ? "Creatomate-Schlüssel ungültig" : res.status === 402 ? "Zu wenig Creatomate-Credits" : res.status === 429 ? "Zu viele Anfragen, bitte kurz warten" : (out?.message ?? `Creatomate-Fehler ${res.status}`);
        return json({ error: msg, details: out }, 400);
      }
      if (body.dryRun) return json({ dryRun: true, ...out });
      const render = Array.isArray(out) ? out[0] : out;
      const srtPath = `exports/${body.projectId}/${Date.now()}.srt`;
      if (body.timeline.subtitles.length) {
        await admin.storage.from(BUCKET).upload(srtPath, new Blob([toSrt(body.timeline.subtitles)], { type: "application/x-subrip; charset=utf-8" }), { upsert: true });
      }
      await admin.from("projects").update({
        render_id: render.id, render_status: render.status ?? "planned", render_error: null,
        export_srt_path: body.timeline.subtitles.length ? srtPath : null,
      }).eq("id", body.projectId);
      return json({ renderId: render.id, status: render.status, warnings: out.warnings ?? [] });
    }

    // status
    const { data: p } = await admin.from("projects").select("render_id, render_status, export_path").eq("id", body.projectId).single();
    if (!p?.render_id) return json({ status: "none" });
    if (p.render_status === "succeeded" && p.export_path) return json({ status: "succeeded", exportPath: p.export_path });
    const res = await fetch(`${API}/${p.render_id}`, { headers });
    const r = await res.json().catch(() => ({}));
    if (!res.ok) return json({ status: p.render_status, error: r?.message ?? `Creatomate-Fehler ${res.status}` });
    if (r.status === "failed") {
      await admin.from("projects").update({ render_status: "failed", render_error: r.error_message ?? "Render fehlgeschlagen" }).eq("id", body.projectId);
      return json({ status: "failed", error: r.error_message });
    }
    if (r.status === "succeeded" && r.url) {
      const file = await fetch(r.url);
      if (!file.ok) return json({ status: "rendering", error: "Download noch nicht möglich" });
      const path = `exports/${body.projectId}/${Date.now()}.mp4`;
      const { error } = await admin.storage.from(BUCKET).upload(path, await file.blob(), { contentType: "video/mp4", upsert: true });
      if (error) throw error;
      await admin.from("projects").update({ render_status: "succeeded", export_path: path }).eq("id", body.projectId);
      return json({ status: "succeeded", exportPath: path });
    }
    await admin.from("projects").update({ render_status: r.status }).eq("id", body.projectId);
    return json({ status: r.status });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }, 500);
  }
});
