// Legt Kie.ai-Tasks an (create / regenerate) und dient als Polling-Rückfallebene (status).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { admin, createKieTask, ERROR_LABEL, KieError, markFailed, syncAsset } from "../_shared/kie-pipeline.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    type: z.enum(["audio", "image", "video", "avatar"]),
    style: z.string().min(1).max(60),
    step: z.enum(["audio", "image", "video", "avatar", "avatar_fallback"]).optional(),
    sceneId: z.string().uuid().nullable().optional(),
    prompt: z.string().max(5000).default(""),
    text: z.string().max(5000).optional(),
    format: z.enum(["16:9", "9:16"]).default("16:9"),
    imageUrl: z.string().url().optional(),
    audioUrl: z.string().url().optional(),
    referenceUrls: z.array(z.string().url()).max(8).optional(),
    voice: z.string().max(80).optional(),
    duration: z.number().min(1).max(60).optional(),
    projectId: z.string().uuid().optional(),
  }),
  z.object({ action: z.literal("regenerate"), assetId: z.string().uuid() }),
  z.object({ action: z.literal("status"), assetId: z.string().uuid() }),
]);

async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data } = await client.auth.getUser();
  if (!data.user) return null;
  const { data: ok } = await admin.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  return ok ? data.user.id : null;
}

type CreateInput = Extract<z.infer<typeof Body>, { action: "create" }>;

async function buildAndStart(assetId: string, req: CreateInput) {
  const step = req.step ?? req.type;
  const { data: cfg } = await admin
    .from("style_model_config")
    .select("*")
    .eq("style", req.style)
    .eq("step", step)
    .eq("active", true)
    .maybeSingle();
  if (!cfg?.model_id) throw new KieError(`Für Stil „${req.style}“ ist bei „${step}“ kein Modell hinterlegt`, "invalid");

  // Kostenlimit des Projekts prüfen
  let projectId = req.projectId ?? null;
  if (!projectId && req.sceneId) {
    const { data: scene } = await admin.from("scenes").select("project_id").eq("id", req.sceneId).maybeSingle();
    projectId = scene?.project_id ?? null;
  }
  {
    if (projectId) {
      const { data: project } = await admin.from("projects").select("cost_limit_credits").eq("id", projectId).single();
      const { data: sceneIds } = await admin.from("scenes").select("id").eq("project_id", projectId);
      const { data: costs } = await admin.from("assets").select("cost_credits").in("scene_id", (sceneIds ?? []).map((s) => s.id));
      const spent = (costs ?? []).reduce((a, c) => a + Number(c.cost_credits ?? 0), 0);
      if (project && spent >= Number(project.cost_limit_credits)) {
        throw new KieError(`Kostenlimit des Projekts erreicht (${spent} von ${project.cost_limit_credits} Credits)`, "credits");
      }
    }
  }

  const params = { ...(cfg.default_params as Record<string, unknown>) };
  const imageField = (params._image_field as string) ?? "image_urls";
  const refField = (params._reference_field as string) ?? "image_input";
  const suffix = (params._prompt_suffix as string) ?? "";
  const fixedDuration = params._fixed_duration as number | undefined;
  const minD = (params._duration_min as number | undefined) ?? 1;
  const maxD = (params._duration_max as number | undefined) ?? 60;
  // Nächstlängere erlaubte Cliplänge; gekürzt wird später in der Timeline.
  let clipSeconds: number | null = null;
  if (req.type === "video") {
    clipSeconds = fixedDuration ?? Math.min(maxD, Math.max(minD, Math.ceil(req.duration ?? minD)));
  }
  for (const k of Object.keys(params)) if (k.startsWith("_")) delete params[k];

  const prompt = [req.prompt, suffix].filter(Boolean).join("\n\n");
  let input: Record<string, unknown> = { ...params };
  if (req.type === "audio") {
    const voice = req.voice || ((params.voice as string) ?? "Rachel");
    delete input.voice;
    input = { ...input, dialogue: [{ text: req.text ?? req.prompt, voice }] };
  } else if (req.type === "image") {
    input = { ...input, prompt, aspect_ratio: req.format };
    if (req.referenceUrls?.length) input[refField] = req.referenceUrls;
  } else if (req.type === "video") {
    input = { ...input, prompt, aspect_ratio: req.format };
    if (req.imageUrl) input[imageField] = imageField.endsWith("s") ? [req.imageUrl] : req.imageUrl;
    if (clipSeconds && !fixedDuration) input.duration = clipSeconds;
    if (cfg.api === "veo") delete input.duration;
  } else {
    input = { ...input, prompt };
    if (req.imageUrl) input.image_url = req.imageUrl;
    if (req.audioUrl) input.audio_url = req.audioUrl;
  }

  const token = crypto.randomUUID();
  const callBackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/kie-callback?asset=${assetId}&token=${token}`;
  await admin.from("assets").update({
    model: cfg.model_id,
    api: cfg.api,
    input_params: { ...req, _callback_token: token, _clip_seconds: clipSeconds },
    status: "queued",
    error_message: null,
    error_kind: null,
    storage_path: null,
    kie_task_id: null,
    finished_at: null,
  }).eq("id", assetId);

  const taskId = await createKieTask(cfg.api, cfg.model_id, input, callBackUrl);
  await admin.from("assets").update({
    kie_task_id: taskId,
    status: "running",
    started_at: new Date().toISOString(),
  }).eq("id", assetId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const userId = await requireAdmin(req);
  if (!userId) return json({ error: "Keine Berechtigung" }, 403);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
  const body = parsed.data;

  if (body.action === "status") {
    const { data: asset } = await admin.from("assets").select("*").eq("id", body.assetId).maybeSingle();
    if (!asset) return json({ error: "Asset nicht gefunden" }, 404);
    try {
      await syncAsset(asset);
    } catch (e) {
      console.error("[status]", e);
    }
    const { data: fresh } = await admin.from("assets").select("*").eq("id", body.assetId).single();
    return json({ asset: fresh });
  }

  let assetId: string;
  let input: CreateInput;
  if (body.action === "regenerate") {
    const { data: asset } = await admin.from("assets").select("id,input_params").eq("id", body.assetId).maybeSingle();
    if (!asset) return json({ error: "Asset nicht gefunden" }, 404);
    const { _callback_token: _t, _clip_seconds: _c, ...rest } = asset.input_params as Record<string, unknown>;
    const again = Body.safeParse({ ...rest, action: "create" });
    if (!again.success) return json({ error: "Ursprüngliche Eingaben ungültig" }, 400);
    assetId = asset.id;
    input = again.data as CreateInput;
  } else {
    input = body;
    const { data: created, error } = await admin
      .from("assets")
      .insert({ type: body.type, scene_id: body.sceneId ?? null, created_by: userId, input_params: body })
      .select("id")
      .single();
    if (error || !created) return json({ error: error?.message ?? "Asset konnte nicht angelegt werden" }, 500);
    assetId = created.id;
  }

  try {
    await buildAndStart(assetId, input);
  } catch (e) {
    const kind = e instanceof KieError ? e.kind : "unknown";
    const msg = e instanceof Error ? e.message : String(e);
    await markFailed(assetId, `${ERROR_LABEL[kind]}: ${msg}`, kind);
  }
  const { data: fresh } = await admin.from("assets").select("*").eq("id", assetId).single();
  return json({ asset: fresh });
});
