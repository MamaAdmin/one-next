// Nimmt Kie.ai-Callbacks entgegen. Der Inhalt des Callbacks wird nicht blind übernommen:
// Wir prüfen das Token und fragen den Task-Status direkt bei Kie.ai nach.
import { admin, syncAsset } from "../_shared/kie-pipeline.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  const url = new URL(req.url);
  const assetId = url.searchParams.get("asset") ?? "";
  const token = url.searchParams.get("token") ?? "";

  const { data: asset } = await admin
    .from("assets")
    .select("id,type,api,status,kie_task_id,started_at,scene_id,input_params")
    .eq("id", assetId)
    .maybeSingle();

  // Immer 200 antworten, damit Kie.ai nicht endlos wiederholt.
  if (!asset || (asset.input_params as Record<string, unknown>)?._callback_token !== token) {
    console.warn("[kie-callback] unbekannter oder ungültiger Callback", assetId);
    return new Response(JSON.stringify({ ok: false }), { headers: { "Content-Type": "application/json" } });
  }

  try {
    const status = await syncAsset(asset);
    return new Response(JSON.stringify({ ok: true, status }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[kie-callback]", e);
    return new Response(JSON.stringify({ ok: false }), { headers: { "Content-Type": "application/json" } });
  }
});
